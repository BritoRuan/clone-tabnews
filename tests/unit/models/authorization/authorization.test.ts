import authorization from "@/models/schemas/authorization/authorization";
import { InternalServerError } from "@/infra/errors/InternalServerError";

describe("models/authorization", () => {
  describe(".can()", () => {
    it("without `user`", () => {
      expect(() => {
        authorization.can();
      }).toThrow(InternalServerError);
    });

    it("without `user.features`", () => {
      const createdUser = {
        id: "2f24af70-fcb4-49a3-b1ff-bde4e07090d8",
        username: "UserWithoutFeatures",
      };
      expect(() => {
        authorization.can(createdUser);
      }).toThrow(InternalServerError);
    });

    it("without unknown `features`", () => {
      const createdUser = {
        features: [],
      };
      expect(() => {
        authorization.can(createdUser, "unknown:feature");
      }).toThrow(InternalServerError);
    });

    it("without valid `user` and known `feature`", () => {
      const createdUser = {
        id: "b56881ad-42b9-42cc-a680-5daa2dd979c3",
        username: "UserWithValidUsernameAndFeature",
        features: ["create:user"],
      };
      expect(authorization.can(createdUser, "create:user")).toBe(true);
    });
  });

  describe(".filterOutput()", () => {
    it("without `user`", () => {
      expect(() => {
        authorization.filterOutput();
      }).toThrow(InternalServerError);
    });

    it("without `user.features`", () => {
      const createdUser = {
        id: "2f24af70-fcb4-49a3-b1ff-bde4e07090d8",
        username: "UserWithoutFeatures",
      };
      expect(() => {
        authorization.filterOutput(createdUser);
      }).toThrow(InternalServerError);
    });

    it("without unknown `features`", () => {
      const createdUser = {
        features: [],
      };
      expect(() => {
        authorization.filterOutput(createdUser, "unknown:feature");
      }).toThrow(InternalServerError);
    });

    it("with valid `user` known `feature` but no `resource`", () => {
      const createdUser = {
        features: ["read:user"],
      };
      expect(() => {
        authorization.filterOutput(createdUser, "read:user");
      }).toThrow(InternalServerError);
    });

    it("without valid `user`, known `feature` and `resource`", () => {
      const createdUser = {
        id: "b56881ad-42b9-42cc-a680-5daa2dd979c3",
        username: "UserWithValidUsernameAndFeature",
        features: ["read:user"],
      };

      const resource = {
        id: "eb9b5840-6c0f-4354-a97f-23ea673126fe",
        email: "resource@resource.com",
        password: "resource",
        username: "UserWithValidUsernameFeatureAndResource",
        features: ["read:user"],
        created_at: "2026-0101T00:00:00.000Z",
        updated_at: "2026-0101T00:00:00.000Z",
      };

      const result = authorization.filterOutput(
        createdUser,
        "read:user",
        resource,
      );

      expect(result).toEqual({
        id: "eb9b5840-6c0f-4354-a97f-23ea673126fe",
        features: ["read:user"],
        username: "UserWithValidUsernameFeatureAndResource",
        created_at: "2026-0101T00:00:00.000Z",
        updated_at: "2026-0101T00:00:00.000Z",
      });
    });
  });
});
