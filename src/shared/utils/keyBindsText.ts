export const keyBindsText: string = `
Insert Mode:
    EXIT_INSERT: esc, return

Normal Mode (global):
    QUIT: q
    ENTER_INSERT: i, ('enter' if not opening new page)
    UP: up_arrow, k
    DOWN: down_arrow, j
    LEFT: left_arrow, h
    RIGHT: right_arrow, l
    TO_START_MENU: 1
    TO_SELECTION_MODE: 2
    TO_EDIT_MODE: 3

Normal Mode (quiz):
    MARK_YES: y, space_bar
    MARK_NO: n
    TOGGLE_SHOW_ANSWER: a
    SHUFFLE_QUESTIONS: rr
    NEXT_QUESTION: right_arrow, l
    PREV_QUESTION: left_arrow, h

Normal Mode (edit menu):
    CLEAR_TEXT: cc,
    DELETE_ITEM: dd,
    TO_BOTTOM_OF_LIST: G
    TO_TOP_OF_LIST: gg
    ENTER_PAGE: enter
    PREV_PAGE: delete

Normal Mode (selection menu):
    TO_BOTTOM_OF_LIST: G
    TO_TOP_OF_LIST: gg
    ENTER_PAGE: enter
    SELECT_QUIZ: enter
    PREV_PAGE: delete
`;
