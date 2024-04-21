import React from "react";
import { useState } from "react";
import { Text, Box, useInput, useApp } from "ink";
import useStdoutDimensions from "./useStdoutDimensions.js";
function QuestionAnswer({ question }) {
    const [flipped, setFlipped] = useState(false);
    let textContent;
    if (flipped) {
        textContent = question.a;
    }
    else {
        textContent = question.q;
    }
    useInput((input) => {
        if (input === "f") {
            setFlipped(!flipped);
        }
        else if (input === "n") {
            setFlipped(!flipped);
        }
    });
    return (React.createElement(React.Fragment, null,
        React.createElement(Text, null, textContent)));
}
function MCList({ choices, currIndex, highlightCorrect, correctAnswer, }) {
    return (React.createElement(Box, { flexDirection: "column", flexGrow: 1 }, choices.map((choice, index) => {
        const choiceMarker = Object.keys(choice)[0];
        const choiceTextContent = choice[choiceMarker];
        let color = "white";
        if (index === currIndex) {
            color = "blue";
        }
        let isInverse = false;
        if (highlightCorrect) {
            if (choiceMarker === correctAnswer) {
                color = "green";
                isInverse = true;
            }
            if (choiceMarker !== correctAnswer && index === currIndex) {
                color = "red";
                isInverse = true;
            }
        }
        return (React.createElement(Box, { borderStyle: "round", borderColor: color, flexGrow: 1, key: index },
            React.createElement(Text, { color: color, inverse: isInverse }, `${choiceMarker}: ${choiceTextContent}`)));
    })));
}
function MultipleChoice({ question }) {
    const [currIndex, setCurrIndex] = useState(0);
    const [isFlashing, setIsFlashing] = useState(false);
    const [highlightCorrect, setHighlightCorrect] = useState(false);
    function flashCorrectAnswer() {
        setIsFlashing(true);
        // setInterval only has access to the global scoped variables at the time
        // of instantiation of the Interval and given that React is immutable,
        // those old highlightCorrect values that would be otherwise garbage
        // collected because they are no longer relevant would still be used by
        // setInterval and thus no changes would be rendered.  This is the
        // reason for creating a locally scoped variable that is NOT part of
        // React's useState hook
        let localScopedHl = false;
        const intervalID = setInterval(() => {
            localScopedHl = !localScopedHl;
            setHighlightCorrect(localScopedHl);
        }, 500);
        setTimeout(() => {
            clearInterval(intervalID);
            setIsFlashing(false);
            setHighlightCorrect(false);
        }, 2000);
    }
    useInput((input, key) => {
        if (input === "j" || key.downArrow) {
            if (currIndex === question.choices.length - 1 || isFlashing) {
                return;
            }
            else {
                setCurrIndex(currIndex + 1);
            }
        }
        if (input === "k" || key.upArrow) {
            if (currIndex === 0 || isFlashing) {
                return;
            }
            else {
                setCurrIndex(currIndex - 1);
            }
        }
        if (input === "n") {
            setCurrIndex(0);
        }
        if (key.return) {
            if (!isFlashing) {
                flashCorrectAnswer();
            }
        }
    });
    return (React.createElement(Box, { justifyContent: "center", flexDirection: "column" },
        React.createElement(Text, null, question.q),
        React.createElement(MCList, { choices: question.choices, currIndex: currIndex, highlightCorrect: highlightCorrect, correctAnswer: question.a })));
}
export function Deck({ questions, }) {
    const [currIndex, setCurrIndex] = useState(0);
    const [currQuestion, setCurrQuestion] = useState(questions[0]);
    const [columns, rows] = useStdoutDimensions();
    const { exit } = useApp();
    useInput((input, key) => {
        if (input === "n") {
            if (currIndex === questions.length - 1) {
                exit();
                return;
            }
            else {
                setCurrQuestion(questions[currIndex + 1]);
                setCurrIndex(currIndex + 1);
            }
        }
    });
    return (React.createElement(Box, { alignItems: "center", justifyContent: "center", height: rows, width: columns },
        React.createElement(Box, { flexDirection: "column", borderStyle: "round", width: 50 }, currQuestion.type === "mc" ? (React.createElement(MultipleChoice, { question: currQuestion })) : (React.createElement(QuestionAnswer, { question: currQuestion })))));
}
//# sourceMappingURL=Cards.js.map