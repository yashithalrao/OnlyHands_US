import { jest } from "@jest/globals";
import request from "supertest";
import app from "../../src/app.js";

jest.mock("../../src/config/db.js", () => ({
  connectDB: jest.fn(),
}));

describe("APPLICATION ROUTES", () => {
  test("POST /api/shifts/123/apply → 401", async () => {
    const res = await request(app).post("/api/shifts/123/apply");
    expect(res.status).toBe(401);
  });
});
