import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CommentForm from "./CommentForm";

describe("CommentForm optimistic flow", () => {
  it("adds optimistic comment then commits", async () => {
    const added: any[] = [];
    const onOptimisticAdd = (c: any) => added.push(c);
    const onCommitAdd = async (_name: string, _text: string, _tid: string) => {
      // pretend network delay
      await new Promise((r) => setTimeout(r, 10));
    };

    render(<CommentForm onOptimisticAdd={onOptimisticAdd} onCommitAdd={onCommitAdd} />);

    const textarea = screen.getByPlaceholderText(/Write a comment/i);
    fireEvent.change(textarea, { target: { value: "Hello world" } });
    fireEvent.submit(textarea.closest("form")!);

    expect(added.length).toBe(1);
    await waitFor(() => expect((textarea as HTMLTextAreaElement).value).toBe(""));
  });
});
