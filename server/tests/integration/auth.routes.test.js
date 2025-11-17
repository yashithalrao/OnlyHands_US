import { jest } from "@jest/globals";
import request from "supertest";
import app from "../../src/app.js";

jest.mock("../../src/config/db.js", () => ({
  connectDB: jest.fn(),
}));

describe("AUTH ROUTES", () => {
  test("POST /api/auth/login missing body → 400", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
  });

  test("GET /api/auth/me without token → 401", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});
