import { useContext, useEffect } from "react";
import { AppContext } from "../App.js";
import { ListPage } from "../shared/utils/PageStack.js";
import { Question } from "../types.js";

export function usePreview(page: ListPage, currIdx: number): void {
    const { previewQst, setPreviewQst } = useContext(AppContext)!;

    useEffect(() => {
        const prevPrev = previewQst.question;
        let nextPrev: Question | "ADD" | null = null;
        if (page.pageType === "SECTION") {
            // if out of range we are at the add question button
            nextPrev = (page.listItems[currIdx] as Question) ?? null;
            if (!nextPrev) {
                nextPrev = "ADD";
            }
        }

        if (page.pageType === "SECTION" && nextPrev !== prevPrev) {
            setPreviewQst({
                question: nextPrev,
                isPage: true,
                isShowing: previewQst.isShowing,
            });
        } else if (page.pageType !== "SECTION" && nextPrev !== prevPrev) {
            setPreviewQst({
                question: null,
                isPage: false,
                isShowing: previewQst.isShowing,
            });
        }
    });
}
