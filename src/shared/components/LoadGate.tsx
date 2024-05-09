import React, { useState } from "react";
import { useLoadData } from "../hooks/useLoadData.js";
import { Quiz } from "../../types.js";
import Read from "../utils/Read.js";
import { LoadingMessage } from "./LoadingMessage.js";
import { EditQuizzesView } from "../../EditQuizzes/EditQuizzesView.js";
import { ChooseQuestionsView } from "../../ChooseQuestions/ChooseQuestionsView.js";

function useLoadQuizData(): Quiz[] | null {
    const [quizzes, setQuizzes] = useState<Quiz[] | null>(null);
    useLoadData<Quiz[]>(Read.getData, setQuizzes);
    return quizzes;
}

// prevent pages rendering prior to recieving data
export class LoadGate {
    static EditQuizzes(): React.ReactNode {
        const quizzes: Quiz[] | null = useLoadQuizData();

        if (quizzes) {
            return <EditQuizzesView quizzes={quizzes} />;
        } else {
            return <LoadingMessage />;
        }
    }

    static ChooseQuestions(): React.ReactNode {
        const quizzes: Quiz[] | null = useLoadQuizData();

        if (quizzes) {
            return <ChooseQuestionsView quizzes={quizzes} />;
        } else {
            return <LoadingMessage />;
        }
    }
}
