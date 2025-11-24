import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

const awsConfigMock = vi.hoisted(() => ({
  ensureAmplifyConfigured: vi.fn(),
  missingAwsEnv: vi.fn(() => [] as string[])
}));

vi.mock("./lib/awsConfig", () => awsConfigMock);

vi.mock("aws-amplify/auth", () => ({
  getCurrentUser: vi.fn(() => Promise.reject(new Error("no user"))),
  fetchAuthSession: vi.fn(() => Promise.resolve({})),
  signInWithRedirect: vi.fn(),
  signOut: vi.fn()
}));

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    awsConfigMock.missingAwsEnv.mockReturnValue([]);
  });

  it("shows missing env warning when required keys are absent", async () => {
    awsConfigMock.missingAwsEnv.mockReturnValue(["VITE_COGNITO_USER_POOL_ID"]);
    render(<App />);
    expect(await screen.findByText("環境変数が未設定です")).toBeTruthy();
  });

  it("renders sign-in button when configuration is complete", async () => {
    render(<App />);
    expect(await screen.findByRole("button", { name: "サインイン" })).toBeTruthy();
  });
});
