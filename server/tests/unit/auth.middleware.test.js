import { jest } from "@jest/globals";
import { createMockRes } from "../utils/mockResponse.js";

jest.unstable_mockModule("jsonwebtoken", () => ({
  __esModule: true,
  default: {
    verify: jest.fn(),
  },
}));

const jwt = (await import("jsonwebtoken")).default;
const { requireAuth } = await import("../../src/middleware/auth.js");

describe("auth middleware", () => {
  let res;
  let next;

  beforeEach(() => {
    res = createMockRes();
    next = jest.fn();
    jest.clearAllMocks();
  });

  test("401 when token missing", () => {
    const req = { cookies: {} };

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalled();
  });

  test("401 when token invalid", () => {
    jwt.verify.mockImplementation(() => {
      throw new Error("bad");
    });

    requireAuth({ cookies: { token: "abc" } }, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("sets userId + role when token valid", () => {
    jwt.verify.mockReturnValue({ sub: "u1", role: "manager" });

    const req = { cookies: { token: "good" } };
    requireAuth(req, res, next);

    expect(req.userId).toBe("u1");
    expect(req.userRole).toBe("manager");
    expect(next).toHaveBeenCalled();
  });
});
