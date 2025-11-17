import { jest } from "@jest/globals";
import request from "supertest";
import app from "../../src/app.js";

jest.mock("../../src/config/db.js", () => ({
  connectDB: jest.fn(),
}));

describe("SHIFT ROUTES", () => {
  test("GET /api/shifts → 401 without auth", async () => {
    const res = await request(app).get("/api/shifts");
    expect(res.status).toBe(401);
  });
});
