// tests/unit/shift.controller.extra.test.js
import { jest } from "@jest/globals";
import { createMockRes } from "../utils/mockResponse.js";

// ----------- MOCK SHIFT + APPLICATION MODELS ------------
jest.unstable_mockModule("../../src/models/Shift.js", () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
  },
}));

jest.unstable_mockModule("../../src/models/Application.js", () => ({
  __esModule: true,
  default: {
    updateMany: jest.fn(),
    aggregate: jest.fn(),
  }
}));

// Import AFTER mocks
const Shift = (await import("../../src/models/Shift.js")).default;
const Application = (await import("../../src/models/Application.js")).default;

const {
  createShift,
  publishShift,
  listShifts,
  completeShift,
  listCompletedShifts,
  getShiftSummaryReport,
} = await import("../../src/controllers/shift.controller.js");

// ---------------------------------------------------------
describe("shift.controller EXTRA COVERAGE", () => {
  let res;
  beforeEach(() => {
    res = createMockRes();
    jest.clearAllMocks();
  });

  // ---------- createShift → DB error (VALID BODY REQUIRED) ----------
  test("createShift → DB error gives 500", async () => {
    Shift.create.mockRejectedValue(new Error("db"));

    await createShift(
      {
        userRole: "manager",
        body: {
          title: "Shift A",
          role: "Helper",
          date: "2030-01-01",
          startTime: "10:00",
          endTime: "11:00",
          headcount: 5,
          allowance: 100,
        },
        userId: "m1",
      },
      res
    );

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // ---------- publishShift ----------
  test("publishShift → success", async () => {
    Shift.findByIdAndUpdate.mockResolvedValue({ id: "1", published: true });

    await publishShift(
      { userRole: "manager", params: { id: "1" } },
      res
    );

    expect(res.json).toHaveBeenCalled();
  });

  // ---------- listShifts ----------
  test("listShifts → volunteer sees only published", async () => {
    Shift.find.mockImplementation((filter) => ({
      sort: jest.fn().mockReturnValue(
        filter.published
          ? [{ id: 1, published: true }]
          : []
      )
    }));

    await listShifts(
      { userRole: "volunteer", query: {} },
      res
    );

    expect(res.json).toHaveBeenCalledWith([{ id: 1, published: true }]);
  });

  test("listShifts → DB error", async () => {
    Shift.find.mockImplementation(() => ({
      sort: () => { throw new Error("db"); }
    }));

    await listShifts(
      { userRole: "manager", query: {} },
      res
    );

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // ---------- completeShift ----------
  test("completeShift → 403 non manager", async () => {
    await completeShift(
      { userRole: "volunteer", params: { id: "x" } },
      res
    );

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("completeShift → DB error", async () => {
    Shift.findById.mockRejectedValue(new Error("db"));

    await completeShift(
      { userRole: "manager", params: { id: "x" } },
      res
    );

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // ---------- listCompletedShifts ----------
  test("listCompletedShifts → empty list", async () => {
    Shift.find.mockImplementation(() => ({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      }),
    }));

    Application.aggregate.mockResolvedValue([]);

    await listCompletedShifts(
      { userRole: "manager" },
      res
    );

    expect(res.json).toHaveBeenCalledWith([]);
  });

  // ---------- getShiftSummaryReport ----------
  test("getShiftSummaryReport → DB error", async () => {
    Shift.find.mockImplementation(() => ({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockRejectedValue(new Error("fail")),
      }),
    }));

    await getShiftSummaryReport(
      { userRole: "manager", query: {} },
      res
    );

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
