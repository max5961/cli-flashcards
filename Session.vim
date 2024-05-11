let SessionLoad = 1
let s:so_save = &g:so | let s:siso_save = &g:siso | setg so=0 siso=0 | setl so=-1 siso=-1
let v:this_session=expand("<sfile>:p")
silent only
silent tabonly
cd ~/repos/flashcards
if expand('%') == '' && !&modified && line('$') <= 1 && getline(1) == ''
  let s:wipebuf = bufnr('%')
endif
let s:shortmess_save = &shortmess
if &shortmess =~ 'A'
  set shortmess=aoOA
else
  set shortmess=aoO
endif
badd +1 ~/repos/flashcards/src/Components/createMode/CreateNew.tsx
badd +366 src/Components/createMode/classes.ts
badd +151 src/Components/quizMode/MultipleChoice.tsx
badd +1 src/Components/createMode/useNav.ts
badd +1 ~/repos/flashcards/src/Components/createMode/useWindow.tsx
badd +1 src/Components/createMode/useQuestionNav.ts
badd +21 ~/repos/flashcards/src/Components/createMode/QuestionNavUtils.ts
badd +1 src/Components/createMode/QuestionNavUtil.ts
badd +7 package.json
badd +32 src/hooks/useLpv.ts
badd +48 ~/repos/flashcards/src/App.tsx
badd +25 ~/repos/flashcards/src/hooks/useNav.ts
badd +1 ~/repos/flashcards/src/hooks/useStdoutDimensions.ts
badd +91 ~/repos/flashcards/src/hooks/useWindow.tsx
badd +1 src/hooks/useStdInput.ts
badd +1 ~/repos/flashcards/src/hooks/useKeyBinds.ts
badd +1 ~/repos/flashcards/src/hooks/useQpv.ts
badd +80 ~/repos/flashcards/src/utils/Nav.ts
badd +35 ~/repos/flashcards/src/hooks/useEqt.ts
badd +1 ~/repos/flashcards/src/hooks/useQABoxes.ts
badd +47 src/hooks/useAddChoice.ts
badd +19 Session.vim
badd +36 ~/repos/flashcards/src/hooks/useMcChoices.ts
badd +1 ~/repos/flashcards/src/utils/useMcText.ts
badd +1 src/types.ts
badd +36 ~/repos/flashcards/src/StartMenu/StartMenu.tsx
badd +1 ~/repos/flashcards/src/old-utils/PageStack.ts
badd +1 ~/repos/flashcards/src/old-utils/KeyBinds.ts
badd +1 ~/repos/flashcards/src/old-utils/LpvUtil.ts
badd +1 ~/repos/flashcards/src/old-utils/QpvUtils.ts
badd +1 ~/repos/flashcards/src/old-utils/createList.tsx
badd +1 ~/repos/flashcards/src/old-utils/Read.ts
badd +6 ~/repos/flashcards/src/shared/hooks/useKeyBinds.ts
badd +1 src/components/choose/ChoosePages.tsx
badd +1 src/utils/Read.ts
badd +3 ~/repos/flashcards/src/shared/hooks/useNav.ts
badd +1 ~/repos/flashcards/src/shared/utils/Nav.ts
badd +6 ~/repos/flashcards/src/shared/utils/Write.ts
badd +40 ~/repos/flashcards/src/shared/utils/Read.ts
badd +5 ~/repos/flashcards/src/shared/utils/ProcessArguments.ts
badd +1 ~/repos/flashcards/src/shared/utils/PageStack.ts
badd +6 ~/repos/flashcards/src/shared/utils/PageStack.spec.ts
badd +121 ~/repos/flashcards/src/shared/utils/KeyBinds.ts
badd +12 ~/repos/flashcards/src/shared/hooks/useLoadData.ts
badd +1 ~/repos/flashcards/src/EditQuizzess/Pages.tsx
badd +1 ~/repos/flashcards/src/EditQuizzess/hooks/useAddChoice.ts
badd +1 ~/repos/flashcards/src/EditQuizzess/hooks/useEqt.ts
badd +1 ~/repos/flashcards/src/EditQuizzess/hooks/useLpv.ts
badd +1 ~/repos/flashcards/src/EditQuizzess/hooks/useMcChoices.ts
badd +1 ~/repos/flashcards/src/EditQuizzess/hooks/useMcText.ts
badd +1 ~/repos/flashcards/src/EditQuizzess/hooks/useQABoxes.ts
badd +1 ~/repos/flashcards/src/EditQuizzess/hooks/useQpv.ts
badd +1 ~/repos/flashcards/src/EditQuizzess/utils/LpvUtil.ts
badd +1 ~/repos/flashcards/src/EditQuizzess/utils/QpvUtils.ts
badd +1 ~/repos/flashcards/src/EditQuizzes/EditQuizzesView.tsx
badd +1 ~/repos/flashcards/src/Quiz/QuizMode.tsx
badd +1 ~/repos/flashcards/src/Quiz/FooterKeybinds.tsx
badd +1 ~/repos/flashcards/src/Quiz/MultipleChoice.tsx
badd +1 ~/repos/flashcards/src/Quiz/QuestionAnswer.tsx
badd +1 ~/repos/flashcards/src/Quiz/QuestionInput.tsx
badd +5 ~/repos/flashcards/src/shared/components/LoadingMessage.tsx
badd +15 ~/repos/flashcards/src/shared/components/LoadGate.tsx
badd +1 src/EditQuizzesView/EditQuizzesView.tsx
badd +1 ~/repos/flashcards/src/ChooseQuestions/ChoosePages.tsx
badd +1 ~/repos/flashcards/src/ChooseQuestions/hooks/useChoosePages.ts
badd +1 ~/repos/flashcards/src/ChooseQuestionsView/ChooseQuizView.tsx
badd +20 ~/repos/flashcards/src/ChooseQuestions/ChooseQuestionsView.tsx
badd +1 ~/repos/flashcards/src/shared/components/ShowMode.tsx
badd +64 ~/repos/flashcards/src/EditQuizzes/hooks/useQpv.ts
badd +80 ~/repos/flashcards/src/EditQuizzes/hooks/useQABoxes.ts
badd +3 ~/repos/flashcards/src/EditQuizzes/hooks/useMcText.ts
badd +1 ~/repos/flashcards/src/EditQuizzes/hooks/useMcChoices.ts
badd +16 ~/repos/flashcards/src/EditQuizzes/hooks/useLpv.ts
badd +33 ~/repos/flashcards/src/EditQuizzes/hooks/useEqt.ts
badd +41 ~/repos/flashcards/src/EditQuizzes/hooks/useAddChoice.ts
badd +19 ~/repos/flashcards/src/shared/components/Icons.tsx
badd +20 ~/repos/flashcards/src/root.tsx
badd +2 ~/repos/flashcards/node_modules/yargs/yargs
badd +1 ~/repos/flashcards/node_modules/yargs/yargs.mjs
badd +1 ~/repos/flashcards/node_modules/@types/yargs/yargs.d.ts
badd +14 src/shared/hooks/useWindow.tsx
badd +17 src/shared/components/TitleBox.tsx
badd +57 src/EditQuizzes/utils/LpvUtil.ts
badd +3 src/EditQuizzes/utils/QpvUtils.ts
badd +31 ~/repos/flashcards/src/shared/hooks/useHistory.ts
badd +1 ~/repos/flashcards/tsconfig.json
badd +10 ~/repos/flashcards/tsconfig-base.json
badd +1 ~/repos/flashcards/.babelrc
badd +6 ~/repos/flashcards/todo.md
argglobal
%argdel
edit ~/repos/flashcards/todo.md
let s:save_splitbelow = &splitbelow
let s:save_splitright = &splitright
set splitbelow splitright
wincmd _ | wincmd |
split
1wincmd k
wincmd w
let &splitbelow = s:save_splitbelow
let &splitright = s:save_splitright
wincmd t
let s:save_winminheight = &winminheight
let s:save_winminwidth = &winminwidth
set winminheight=0
set winheight=1
set winminwidth=0
set winwidth=1
wincmd =
argglobal
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=0
setlocal fml=1
setlocal fdn=20
setlocal fen
silent! normal! zE
let &fdl = &fdl
let s:l = 6 - ((5 * winheight(0) + 20) / 41)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 6
normal! 085|
wincmd w
argglobal
if bufexists(fnamemodify("term://~/repos/flashcards//58422:/usr/bin/zsh;\#toggleterm\#1", ":p")) | buffer term://~/repos/flashcards//58422:/usr/bin/zsh;\#toggleterm\#1 | else | edit term://~/repos/flashcards//58422:/usr/bin/zsh;\#toggleterm\#1 | endif
if &buftype ==# 'terminal'
  silent file term://~/repos/flashcards//58422:/usr/bin/zsh;\#toggleterm\#1
endif
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=0
setlocal fml=1
setlocal fdn=20
setlocal fen
let s:l = 46 - ((0 * winheight(0) + 5) / 10)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 46
normal! 041|
wincmd w
wincmd =
tabnext 1
if exists('s:wipebuf') && len(win_findbuf(s:wipebuf)) == 0 && getbufvar(s:wipebuf, '&buftype') isnot# 'terminal'
  silent exe 'bwipe ' . s:wipebuf
endif
unlet! s:wipebuf
set winheight=1 winwidth=20
let &shortmess = s:shortmess_save
let &winminheight = s:save_winminheight
let &winminwidth = s:save_winminwidth
let s:sx = expand("<sfile>:p:r")."x.vim"
if filereadable(s:sx)
  exe "source " . fnameescape(s:sx)
endif
let &g:so = s:so_save | let &g:siso = s:siso_save
nohlsearch
let g:this_session = v:this_session
let g:this_obsession = v:this_session
doautoall SessionLoadPost
unlet SessionLoad
" vim: set ft=vim :
