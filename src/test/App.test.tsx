import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "@/App";

import { POST as analyze } from "../../api/analyze";
import { PROJECT_CONTENT } from "../../server/content";

const CSV = "id,X1,X2,X3,y\npatient_1,1,2,3,3\npatient_2,3,2,1,4\n";

/** Stands in for the static samples and the API, routed by URL. */
async function mockFetch(url: string, init?: RequestInit): Promise<Response> {
  if (url === "/api/analyze") return analyze(new Request(`http://localhost${url}`, init));
  if (url.startsWith("/samples/")) return new Response(CSV);
  if (url === "/api/project") return Response.json(PROJECT_CONTENT);
  if (url === "/api/github") return Response.json({ configured: false, username: null, repos: [] });
  return Response.json({ error: "Not found." }, { status: 404 });
}

describe("App", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL, init?: RequestInit) => mockFetch(String(input), init)),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads the bundled sample and lists its signals", async () => {
    render(<App />);
    expect(await screen.findAllByText("patient_1")).not.toHaveLength(0);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/severity grades/i);
  });

  it("renders model results from the API and re-ranks them by metric", async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole("tab", { name: "ROC-AUC" }));
    const results = document.getElementById("results")!;
    expect(results.querySelector("li")).toHaveTextContent("SVM (RBF)");
  });

  it("hides the GitHub section when no username is configured", async () => {
    render(<App />);
    await screen.findByRole("tab", { name: "ROC-AUC" });
    expect(document.getElementById("projects")).toBeNull();
  });

  it("runs the analysis on the server API when selected", async () => {
    render(<App />);
    await screen.findAllByText("patient_1");
    fireEvent.click(screen.getByRole("button", { name: /server api/i }));
    expect(await screen.findByText(/computed on server in/i)).toBeInTheDocument();
  });
});
