// tests/unit/application.controller.extra.test.js
import { jest } from "@jest/globals";
import { createMockRes } from "../utils/mockResponse.js";

jest.unstable_mockModule("../../src/models/Application.js", () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndDelete: jest.fn(),
    deleteOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  },
}));

jest.unstable_mockModule("../../src/models/Shift.js", () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}));

const Application = (await import("../../src/models/Application.js")).default;
const Shift = (await import("../../src/models/Shift.js")).default;

const {
  listMyApplications,
  cancelMyApplication,
  approveApplication,
} = await import("../../src/controllers/application.controller.js");

describe("application.controller EXTRA COVERAGE", () => {
  let res;

  beforeEach(() => {
    res = createMockRes();
    jest.clearAllMocks();
  });

  // ----------------------------------------------------------
  // LIST MY APPLICATIONS
  // ----------------------------------------------------------
  test("listMyApplications → returns empty array", async () => {
    Application.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      }),
    });

    await listMyApplications({ userId: "u1" }, res);

    expect(res.json).toHaveBeenCalledWith([]);
  });

  test("listMyApplications → missing userId returns []", async () => {
    const localRes = createMockRes();

    await listMyApplications({}, localRes);

    expect(localRes.status).toHaveBeenCalledWith(401);
  });

  // ----------------------------------------------------------
  // CANCEL APPLICATION
  // ----------------------------------------------------------
  test("cancelMyApplication → success path", async () => {
    Application.findOne.mockResolvedValue({ status: "pending" });
    Application.deleteOne.mockResolvedValue({}); // FIXED

    await cancelMyApplication(
      { userId: "u1", params: { applicationId: "a1" } },
      res
    );

    expect(res.json).toHaveBeenCalledWith({
      message: "Application cancelled successfully",
    });
  });

  test("cancelMyApplication → internal error", async () => {
    Application.findOne.mockRejectedValue(new Error("fail"));

    await cancelMyApplication(
      { userId: "u1", params: { applicationId: "a1" } },
      res
    );

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // ----------------------------------------------------------
  // APPROVE APPLICATION
  // ----------------------------------------------------------
  test("approveApplication → shift update fails", async () => {
    Application.findById.mockResolvedValue({
      shiftId: "s1",
      status: "pending",
      save: jest.fn(),
    });

    Shift.findById.mockResolvedValue(null);

    await approveApplication({ params: { applicationId: "x" } }, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("approveApplication → success", async () => {
    const saveMock = jest.fn();

    Application.findById.mockResolvedValue({
      shiftId: "s1",
      status: "pending",
      save: saveMock,
    });

    Shift.findById.mockResolvedValue({ id: "s1" });

    await approveApplication(
      { params: { applicationId: "x" }, userId: "mgr1" },
      res
    );

    expect(saveMock).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  test("approveApplication → DB throws error", async () => {
    Application.findById.mockRejectedValue(new Error("db"));

    await approveApplication({ params: { applicationId: "x" } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
