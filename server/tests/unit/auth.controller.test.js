import { jest } from "@jest/globals";
import { createMockRes } from "../utils/mockResponse.js";

jest.unstable_mockModule("../../src/models/User.js", () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    findById: jest.fn(),
  },
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
  __esModule: true,
  default: {
    sign: jest.fn(),
    verify: jest.fn(),
  },
}));

const User = (await import("../../src/models/User.js")).default;
const jwt = (await import("jsonwebtoken")).default;

const { login, me, logout } = await import("../../src/controllers/auth.controller.js");

describe("auth.controller", () => {
  let res;

  beforeEach(() => {
    res = createMockRes();
    jest.clearAllMocks();
  });

  test("login → 401 when user missing", async () => {
    User.findOne.mockResolvedValue(null);

    await login({ body: { email: "x@y.com", password: "123" } }, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("login → success", async () => {
    const user = {
      _id: "123",
      email: "a@b.com",
      password: "hashed",
      comparePassword: jest.fn().mockResolvedValue(true),
    };

    User.findOne.mockResolvedValue(user);
    jwt.sign.mockReturnValue("token123");

    await login({ body: { email: "a@b.com", password: "123" } }, res);

    expect(res.cookie).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  test("me → 404 when missing", async () => {
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    await me({ userId: "123" }, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("logout → clears cookie", async () => {
    await logout({}, res);
    expect(res.clearCookie).toHaveBeenCalled();
  });
});
