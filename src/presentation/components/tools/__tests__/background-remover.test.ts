import { describe, expect, it } from "vitest";
import {
  INITIAL_MODEL_PROGRESS,
  modelProgressReducer,
  type ModelProgressAction,
  type ModelProgressState,
} from "../background-remover";

type Step = [ModelProgressAction["source"], number | null];

// 依序送入動作，回傳每一步之後畫面會顯示的值
function replay(
  steps: Step[],
  from: ModelProgressState = INITIAL_MODEL_PROGRESS,
): Array<number | null> {
  const shown: Array<number | null> = [];
  let state = from;
  for (const [source, value] of steps) {
    state = modelProgressReducer(state, { source, value });
    shown.push(state.shown);
  }
  return shown;
}

function expectNeverDecreases(shown: Array<number | null>) {
  for (let i = 1; i < shown.length; i++) {
    expect(shown[i]).not.toBeNull();
    expect(shown[i]!).toBeGreaterThanOrEqual(shown[i - 1]!);
  }
}

describe("modelProgressReducer", () => {
  it("初始狀態應該不顯示進度", () => {
    expect(INITIAL_MODEL_PROGRESS.shown).toBeNull();
  });

  it("只有一個來源回報時應該顯示該來源的進度", () => {
    expect(replay([["preload", 0.3]])).toEqual([0.3]);
    expect(replay([["queue", 0.6]])).toEqual([0.6]);
  });

  it("進度為 0 時應該視為有值並顯示", () => {
    expect(replay([["preload", 0]])).toEqual([0]);
  });

  it("兩個來源都有值時應該顯示較大者", () => {
    expect(replay([["preload", 0.2], ["queue", 0.7]])).toEqual([0.2, 0.7]);
    expect(replay([["preload", 0.9], ["queue", 0.4]])).toEqual([0.9, 0.9]);
  });

  it("照函式庫實際回報方式重播時顯示值應該每一步都不變小", () => {
    // 函式庫一次初始化依序下載三份資源（模型、.wasm、.mjs），每份各自從 0 算到 100；
    // 預載與佇列各下載一次，佇列夾在中間回報較低的值，預載先結束而佇列還在進行
    const steps: Step[] = [
      // 預載：第一份資源
      ["preload", 0],
      ["preload", 0.5],
      ["queue", 0],
      ["preload", 0.9],
      ["queue", 0.2],
      ["preload", 1],
      // 預載：第二份資源，從 0 重新開始
      ["preload", 0],
      ["queue", 0.4],
      ["preload", 0.5],
      ["preload", 1],
      // 預載：第三份資源，從 0 重新開始
      ["preload", 0],
      ["queue", 0.6],
      ["preload", 1],
      // 預載先結束，佇列還在跑自己的三份資源
      ["preload", null],
      ["queue", 0.8],
      ["queue", 1],
      ["queue", 0],
      ["queue", 0.5],
      ["queue", 1],
      ["queue", 0],
      ["queue", 1],
    ];
    const shown = replay(steps);
    expect(shown).toHaveLength(steps.length);
    expectNeverDecreases(shown);
    expect(shown[shown.length - 1]).toBe(1);
  });

  it("單一來源從 100 掉回 80、60 時顯示值應該不往回掉", () => {
    // 把關時實測到的掉落序列：…90,100,80,90,100,60,80,100…
    const shown = replay(
      [0.9, 1, 0.8, 0.9, 1, 0.6, 0.8, 1].map((v): Step => ["queue", v]),
    );
    expect(shown).toEqual([0.9, 1, 1, 1, 1, 1, 1, 1]);
  });

  it("只有一個來源送 null、另一個還在進行時顯示值應該不變小", () => {
    const shown = replay([
      ["preload", 0.9],
      ["queue", 0.3],
      ["preload", null],
      ["queue", 0.4],
    ]);
    expect(shown).toEqual([0.9, 0.9, 0.9, 0.9]);
  });

  it("兩個來源都送 null 時應該隱藏進度", () => {
    const shown = replay([
      ["preload", 0.9],
      ["queue", 0.3],
      ["preload", null],
      ["queue", null],
    ]);
    expect(shown[shown.length - 1]).toBeNull();
  });

  it("兩個來源都結束後重新開始時應該可以從低值顯示", () => {
    const shown = replay([
      ["preload", 1],
      ["preload", null],
      ["queue", 0.1],
      ["queue", 0.2],
    ]);
    expect(shown).toEqual([1, null, 0.1, 0.2]);
  });

  it("應該回傳新物件而不修改傳入的狀態", () => {
    const before: ModelProgressState = { preload: 0.5, queue: null, shown: 0.5 };
    const after = modelProgressReducer(before, { source: "queue", value: 0.7 });
    expect(before).toEqual({ preload: 0.5, queue: null, shown: 0.5 });
    expect(after).toEqual({ preload: 0.5, queue: 0.7, shown: 0.7 });
  });
});
