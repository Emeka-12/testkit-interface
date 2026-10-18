import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";

describe("App command copy", () => {
  const originalClipboard = navigator.clipboard;

  afterEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      configurable: true,
    });
    vi.restoreAllMocks();
  });

  it("copies the currently generated command to the clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith("soroban-testkit coverage . --format html --open"),
    );
    expect(await screen.findByRole("button", { name: "Copied" })).toBeInTheDocument();
  });

  it("copies the command for the selected tab, not the default one", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "audit" }));
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith("soroban-testkit audit . --strict"),
    );
  });

  it("still copies successfully when the browser has no Clipboard API", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
    });
    const execCommand = vi.fn().mockReturnValue(true);
    document.execCommand = execCommand;

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    await waitFor(() => expect(execCommand).toHaveBeenCalledWith("copy"));
    expect(await screen.findByRole("button", { name: "Copied" })).toBeInTheDocument();
  });
});

describe("Coverage option combinations component tests (#200)", () => {
  const originalClipboard = navigator.clipboard;

  afterEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      configurable: true,
    });
    vi.restoreAllMocks();
  });

  it("updates format dropdown options (html, lcov, text)", () => {
    render(<App />);
    const formatSelect = screen.getByLabelText(/report format/i);

    fireEvent.change(formatSelect, { target: { value: "lcov" } });
    expect(
      screen.getByText("soroban-testkit coverage . --format lcov --open"),
    ).toBeInTheDocument();

    fireEvent.change(formatSelect, { target: { value: "text" } });
    expect(
      screen.getByText("soroban-testkit coverage . --format text --open"),
    ).toBeInTheDocument();

    fireEvent.change(formatSelect, { target: { value: "html" } });
    expect(
      screen.getByText("soroban-testkit coverage . --format html --open"),
    ).toBeInTheDocument();
  });

  it("toggles open report checkbox flag", () => {
    render(<App />);
    const openCheckbox = screen.getByLabelText(/open report when complete/i);

    // Uncheck open report
    fireEvent.click(openCheckbox);
    expect(
      screen.getByText("soroban-testkit coverage . --format html"),
    ).toBeInTheDocument();

    // Check open report back on
    fireEvent.click(openCheckbox);
    expect(
      screen.getByText("soroban-testkit coverage . --format html --open"),
    ).toBeInTheDocument();
  });

  it("quotes coverage path when containing spaces and copies combined command", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    render(<App />);

    const pathInput = screen.getByLabelText(/project or contract path/i);
    const formatSelect = screen.getByLabelText(/report format/i);
    const openCheckbox = screen.getByLabelText(/open report when complete/i);

    fireEvent.change(pathInput, { target: { value: "./contracts/my escrow" } });
    fireEvent.change(formatSelect, { target: { value: "lcov" } });
    fireEvent.click(openCheckbox); // unchecked

    const expectedCommand = 'soroban-testkit coverage "./contracts/my escrow" --format lcov';
    expect(screen.getByText(expectedCommand)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(expectedCommand));
  });
});

describe("Limits option combinations component tests (#199)", () => {
  const originalClipboard = navigator.clipboard;

  afterEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      configurable: true,
    });
    vi.restoreAllMocks();
  });

  it("renders default limits options and allows editing function and ramp", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "limits" }));

    const fnInput = screen.getByLabelText(/function/i);
    const rampInput = screen.getByLabelText(/ramp parameter/i);

    expect(fnInput).toHaveValue("batch_payout");
    expect(rampInput).toHaveValue("recipients");

    fireEvent.change(fnInput, { target: { value: "deposit_tokens" } });
    fireEvent.change(rampInput, { target: { value: "depositors" } });

    expect(
      screen.getByText(
        "soroban-testkit limits --contract . --fn deposit_tokens --ramp depositors",
      ),
    ).toBeInTheDocument();
  });

  it("handles paths with spaces and copies limits command combinations", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "limits" }));

    const pathInput = screen.getByLabelText(/project or contract path/i);
    const fnInput = screen.getByLabelText(/function/i);
    const rampInput = screen.getByLabelText(/ramp parameter/i);

    fireEvent.change(pathInput, {
      target: { value: "./target/release build/token.wasm" },
    });
    fireEvent.change(fnInput, { target: { value: "mint_batch" } });
    fireEvent.change(rampInput, { target: { value: "accounts" } });

    const expectedCommand =
      'soroban-testkit limits --contract "./target/release build/token.wasm" --fn mint_batch --ramp accounts';
    expect(screen.getByText(expectedCommand)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(expectedCommand));
  });
});

describe("Audit option combinations component tests (#198)", () => {
  const originalClipboard = navigator.clipboard;

  afterEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      configurable: true,
    });
    vi.restoreAllMocks();
  });

  it("toggles fail on warnings strict mode in audit workflow", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "audit" }));

    const strictCheckbox = screen.getByLabelText(/fail on warnings/i);
    expect(strictCheckbox).toBeChecked();
    expect(screen.getByText("soroban-testkit audit . --strict")).toBeInTheDocument();

    // Uncheck strict
    fireEvent.click(strictCheckbox);
    expect(strictCheckbox).not.toBeChecked();
    expect(screen.getByText("soroban-testkit audit .")).toBeInTheDocument();

    // Check strict again
    fireEvent.click(strictCheckbox);
    expect(strictCheckbox).toBeChecked();
    expect(screen.getByText("soroban-testkit audit . --strict")).toBeInTheDocument();
  });

  it("quotes audit path with spaces and copies command to clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "audit" }));

    const pathInput = screen.getByLabelText(/project or contract path/i);
    const strictCheckbox = screen.getByLabelText(/fail on warnings/i);

    fireEvent.change(pathInput, { target: { value: "./contracts/safe math" } });
    fireEvent.click(strictCheckbox); // uncheck strict

    const expectedCommand = 'soroban-testkit audit "./contracts/safe math"';
    expect(screen.getByText(expectedCommand)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(expectedCommand));
  });
});

describe("Workflow switching component tests (#201)", () => {
  it("switches between all three workflows and updates descriptions and controls", () => {
    render(<App />);

    const coverageButton = screen.getByRole("button", { name: "coverage" });
    const limitsButton = screen.getByRole("button", { name: "limits" });
    const auditButton = screen.getByRole("button", { name: "audit" });

    // Initial state: coverage
    expect(coverageButton).toHaveClass("active");
    expect(limitsButton).not.toHaveClass("active");
    expect(auditButton).not.toHaveClass("active");
    expect(
      screen.getByText("Generate contract-test coverage through cargo-llvm-cov."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/report format/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/open report when complete/i)).toBeInTheDocument();

    // Switch to limits
    fireEvent.click(limitsButton);
    expect(coverageButton).not.toHaveClass("active");
    expect(limitsButton).toHaveClass("active");
    expect(auditButton).not.toHaveClass("active");
    expect(
      screen.getByText("Ramp a contract input to find its practical resource ceiling."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/function/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ramp parameter/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/report format/i)).not.toBeInTheDocument();

    // Switch to audit
    fireEvent.click(auditButton);
    expect(coverageButton).not.toHaveClass("active");
    expect(limitsButton).not.toHaveClass("active");
    expect(auditButton).toHaveClass("active");
    expect(
      screen.getByText("Scan contract sources for common auth, arithmetic, and TTL risks."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/fail on warnings/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/function/i)).not.toBeInTheDocument();

    // Switch back to coverage
    fireEvent.click(coverageButton);
    expect(coverageButton).toHaveClass("active");
    expect(screen.getByLabelText(/report format/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/fail on warnings/i)).not.toBeInTheDocument();
  });

  it("updates generated command and copies accurately when switching workflows", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    render(<App />);

    // In coverage
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith("soroban-testkit coverage . --format html --open"),
    );

    // Switch to limits
    fireEvent.click(screen.getByRole("button", { name: "limits" }));
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(
        "soroban-testkit limits --contract . --fn batch_payout --ramp recipients",
      ),
    );

    // Switch to audit
    fireEvent.click(screen.getByRole("button", { name: "audit" }));
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith("soroban-testkit audit . --strict"),
    );
  });
});
