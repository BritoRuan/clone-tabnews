"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shorthands = void 0;
exports.up = up;
exports.down = down;
exports.shorthands = undefined;
async function up(pgm) {
  pgm.createTable("migration_tests", {
    id: {
      type: "serial",
      primaryKey: true,
    },
    name: {
      type: "text",
      notNull: true,
      default: "'migration-test'",
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("now()"),
    },
  });
}
async function down(pgm) {
  pgm.dropTable("migration_tests");
}
