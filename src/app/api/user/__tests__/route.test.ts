// Mock Request for testing
global.Request = class Request {
  constructor(
    public url: string,
    public init?: { headers?: Record<string, string> },
  ) {}

  headers = {
    get: (name: string) => this.init?.headers?.[name] || null,
  };
} as unknown as typeof Request;

// Mock NextAuth before any imports
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/lib/user-service", () => ({
  findUserById: jest.fn(),
}));

// Mock NextResponse
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
      statusText: init?.statusText || "OK",
      headers: new Map(Object.entries(init?.headers || {})),
    })),
  },
}));

// Mock rate limiting
jest.mock("@/lib/rate-limit", () => ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  withRateLimit: jest.fn((_limiter, _message) => (handler: unknown) => handler),
  userDataRateLimiter: {},
}));

import { GET } from "../route";
import { getServerSession } from "next-auth";
import { findUserById } from "@/lib/user-service";

const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>;
const mockFindUserById = findUserById as jest.MockedFunction<
  typeof findUserById
>;

describe("/api/user", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("should return 401 when no session exists", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const response = await GET(new Request("http://localhost/api/user"));
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: "Unauthorized" });
    });

    it("should return 401 when session has no user", async () => {
      mockGetServerSession.mockResolvedValue({
        user: null,
        expires: "2024-12-31",
      });

      const response = await GET(new Request("http://localhost/api/user"));
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: "Unauthorized" });
    });

    it("should return 401 when user has no id", async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          name: "Test User",
          email: "test@example.com",
        },
        expires: "2024-12-31",
      });

      const response = await GET(new Request("http://localhost/api/user"));
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: "Unauthorized" });
    });

    it("should return 404 when user is not found in database", async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: "123",
          name: "Test User",
          email: "test@example.com",
        },
        expires: "2024-12-31",
      });

      mockFindUserById.mockResolvedValue(null);

      const response = await GET(new Request("http://localhost/api/user"));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: "User not found" });
      expect(mockFindUserById).toHaveBeenCalledWith("123");
    });

    it("should return user data when user is found", async () => {
      const mockUser = {
        id: "123",
        username: "testuser",
        email: "test@example.com",
        is_active: true,
        created_at: new Date("2024-01-01T00:00:00.000Z"),
        updated_at: new Date("2024-01-01T00:00:00.000Z"),
      };

      mockGetServerSession.mockResolvedValue({
        user: {
          id: "123",
          name: "Test User",
          email: "test@example.com",
        },
        expires: "2024-12-31",
      });

      mockFindUserById.mockResolvedValue(mockUser);

      const response = await GET(new Request("http://localhost/api/user"));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        id: "123",
        username: "testuser",
        email: "test@example.com",
        isActive: true,
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      });
      expect(mockFindUserById).toHaveBeenCalledWith("123");
    });

    it("should return 500 when database query fails", async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: "123",
          name: "Test User",
          email: "test@example.com",
        },
        expires: "2024-12-31",
      });

      mockFindUserById.mockRejectedValue(
        new Error("Database connection failed"),
      );

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const response = await GET(new Request("http://localhost/api/user"));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "Internal server error" });
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching user data:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it("should handle non-Error exceptions", async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: "123",
          name: "Test User",
          email: "test@example.com",
        },
        expires: "2024-12-31",
      });

      mockFindUserById.mockRejectedValue("String error");

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const response = await GET(new Request("http://localhost/api/user"));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "Internal server error" });
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching user data:",
        "String error",
      );

      consoleSpy.mockRestore();
    });

    it("should exclude sensitive information from response", async () => {
      const mockUser = {
        id: "123",
        username: "testuser",
        email: "test@example.com",
        is_active: true,
        created_at: new Date("2024-01-01T00:00:00.000Z"),
        updated_at: new Date("2024-01-01T00:00:00.000Z"),
        password_hash: "hashed_password", // This should not be in response
      };

      mockGetServerSession.mockResolvedValue({
        user: {
          id: "123",
          name: "Test User",
          email: "test@example.com",
        },
        expires: "2024-12-31",
      });

      mockFindUserById.mockResolvedValue(mockUser);

      const response = await GET(new Request("http://localhost/api/user"));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).not.toHaveProperty("password_hash");
      expect(data).toEqual({
        id: "123",
        username: "testuser",
        email: "test@example.com",
        isActive: true,
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      });
    });
  });
});
