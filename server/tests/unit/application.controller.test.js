import { jest } from "@jest/globals";
import { createMockRes } from "../utils/mockResponse.js";

jest.unstable_mockModule("../../src/models/Application.js", () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndDelete: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  }
}));

jest.unstable_mockModule("../../src/models/Shift.js", () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  }
}));

const Application = (await import("../../src/models/Application.js")).default;
const Shift = (await import("../../src/models/Shift.js")).default;

const {
  listMyApplications,
  cancelMyApplication,
  approveApplication
} = await import("../../src/controllers/application.controller.js");

describe("application.controller", () => {
  let res;

  beforeEach(() => {
    res = createMockRes();
    jest.clearAllMocks();
  });

  test("listMyApplications → works", async () => {
    Application.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue([{ id: 1 }])
    });

    await listMyApplications({ userId: "u1" }, res);
    expect(res.json).toHaveBeenCalled();
  });

  test("cancelMyApplication → 404", async () => {
    Application.findOneAndDelete.mockResolvedValue(null);

    await cancelMyApplication(
      { userId: "u1", params: { applicationId: "a1" } },
      res
    );

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("approveApplication → 404 missing", async () => {
    Application.findById.mockResolvedValue(null);

    await approveApplication(
      { params: { applicationId: "x" } },
      res
    );

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
