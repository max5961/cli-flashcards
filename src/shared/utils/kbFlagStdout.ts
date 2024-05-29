export const kbFlagStdout: string = `
Insert Mode:
    EXIT_INSERT:          esc, return

Normal Mode (global):
    QUIT:                 q
    ENTER_INSERT:         i, e, ('enter' if not opening new page)
    UP:                   up_arrow, k
    DOWN:                 down_arrow, j
    LEFT:                 left_arrow, h
    RIGHT:                right_arrow, l
    PREV_PAGE:            backspace, delete
    GO_TO_START_MENU:     1
    GO_TO_SELECTION_VIEW: 2
    GO_TO_EDIT_VIEW:      3
    TOGGLE_PREVIEW        p (when applicable)

Normal Mode (quiz):
    MARK_YES:             y, space_bar
    MARK_NO:              n
    TOGGLE_SHOW_ANSWER:   a
    SHUFFLE_QUESTIONS:    S
    NEXT_QUESTION:        right_arrow, l
    PREV_QUESTION:        left_arrow, h

Normal Mode (edit):
    CLEAR_TEXT:           cc
    DELETE_ITEM:          dd
    ENTER_PAGE:           enter
    PREV_PAGE:            delete
    TO_BOTTOM_OF_LIST:    G
    TO_TOP_OF_LIST:       gg

Normal Mode (selection):
    ENTER_PAGE:           enter
    SELECT_QUIZ:          enter
    PREV_PAGE:            delete
    TO_BOTTOM_OF_LIST:    G
    TO_TOP_OF_LIST:       gg
`;
