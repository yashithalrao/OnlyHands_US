import { jest } from "@jest/globals";
import { createMockRes } from "../utils/mockResponse.js";

jest.unstable_mockModule("../../src/models/Shift.js", () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn()
  },
}));

jest.unstable_mockModule("../../src/models/Application.js", () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndDelete: jest.fn(),
    create: jest.fn(),
    findById: jest.fn()
  },
}));

// import AFTER mocks
const Shift = (await import("../../src/models/Shift.js")).default;
const {
  createShift,
  publishShift,
  listShifts,
  listCompletedShifts,
  getShiftSummaryReport,
} = await import("../../src/controllers/shift.controller.js");

describe("shift.controller", () => {
  let res;

  beforeEach(() => {
    res = createMockRes();
    jest.clearAllMocks();
  });

  test("createShift → 403 when not manager", async () => {
    await createShift({ userRole: "volunteer" }, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("publishShift → 404 when missing", async () => {
    Shift.findByIdAndUpdate.mockResolvedValue(null);

    await publishShift({ userRole: "manager", params: { id: "x" } }, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("listShifts → success", async () => {
  Shift.find.mockReturnValue({
    sort: jest.fn().mockReturnValue([{ id: 1 }]),
  });

  await listShifts(
    { userRole: "manager", query: {} },
    res
  );

  expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
});


  test("listCompletedShifts → success", async () => {
    Shift.find.mockReturnValue({
      sort: jest.fn().mockReturnValue([{ id: 1 }]),
    });

    await listCompletedShifts({}, res);
    expect(res.json).toHaveBeenCalled();
  });

  test("getShiftSummaryReport → success", async () => {
    Shift.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([{ id: 1 }]),
    });

    await getShiftSummaryReport({}, res);
    expect(res.json).toHaveBeenCalled();
  });
});
