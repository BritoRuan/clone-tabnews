import { RequestUser } from "@/infra/types/next/next";
import { ResourceRequest } from "./types/resource.request.types";
import { InternalServerError } from "@/infra/errors/InternalServerError";

const availableFeatures = [
  // USER

  "create:user",
  "read:user",
  "read:user:self",
  "update:user",
  "update:user:others",

  // SESSION

  "create:session",
  "read:session",

  // ACTIVATION_TOKEN

  "read:activation_token",

  // MIGRATION

  "create:migration",
  "read:migration",

  // STATUS

  "read:status",
  "read:status:all",
];

function can(user?: RequestUser, feature?: string, resource?: ResourceRequest) {
  validateUser(user);
  validateFeature(feature);

  let authorized = false;

  if (user.features.includes(feature)) {
    authorized = true;
  }

  if (feature === "update:user" && resource) {
    authorized = false;

    if (user.id === resource.id || can(user, "update:user:others")) {
      authorized = true;
    }
  }

  return authorized;
}

function filterOutput(user?: RequestUser, feature?: string, resource?: any) {
  validateUser(user);
  validateFeature(feature);
  validateResource(resource);

  if (feature === "read:user") {
    return {
      id: resource.id,
      username: resource.username,
      features: resource.features,
      created_at: resource.created_at,
      updated_at: resource.updated_at,
    };
  }

  if (feature === "read:user:self") {
    if (user.id === resource.id) {
      return {
        id: resource.id,
        username: resource.username,
        email: resource.email,
        features: resource.features,
        created_at: resource.created_at,
        updated_at: resource.updated_at,
      };
    }
  }

  if (feature === "read:session") {
    if (user.id === resource.user_id) {
      return {
        id: resource.id,
        token: resource.token,
        user_id: resource.user_id,
        created_at: resource.created_at,
        updated_at: resource.updated_at,
        expires_at: resource.expires_at,
      };
    }
  }

  if (feature === "read:activation_token") {
    return {
      id: resource.id,
      user_id: resource.user_id,
      created_at: resource.created_at,
      updated_at: resource.updated_at,
      expires_at: resource.expires_at,
      used_at: resource.used_at,
    };
  }

  if (feature === "read:migration") {
    return resource.map((migration) => {
      return {
        path: migration.path,
        name: migration.name,
        timestamp: migration.timestamp,
      };
    });
  }

  if (feature === "read:status") {
    if (user.features.includes("read:status:all")) {
      return {
        updated_at: resource.updated_at,
        dependencies: {
          database: {
            version: resource.dependencies.database.version,
            max_connections: resource.dependencies.database.max_connections,
            opened_connections:
              resource.dependencies.database.opened_connections,
          },
        },
      };
    }

    return {
      updated_at: resource.updated_at,
      dependencies: {
        database: {
          max_connections: resource.dependencies.database.max_connections,
          opened_connections: resource.dependencies.database.opened_connections,
        },
      },
    };
  }
}

function validateUser(user: RequestUser) {
  if (!user || !user.features) {
    throw new InternalServerError({
      cause: "É necessário fornecer `user` no model `authorization`.",
    });
  }
}

function validateFeature(feature: string) {
  if (!feature || !availableFeatures.includes(feature)) {
    throw new InternalServerError({
      cause:
        "É necessário fornecer uma `feature` conhecida no model `authorization`.",
    });
  }
}

function validateResource(resource: string) {
  if (typeof resource !== "object") {
    throw new InternalServerError({
      cause:
        "É necessário fornecer um objeto em `resource` no model `authorization",
    });
  }

  if (!resource) {
    throw new InternalServerError({
      cause:
        "É necessário fornecer um `resource` em `authorization.filterOutput()`.",
    });
  }
}

const authorization = {
  can,
  filterOutput,
};

export default authorization;
