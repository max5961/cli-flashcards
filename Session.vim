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
badd +1 package.json
badd +32 src/hooks/useLpv.ts
badd +13 ~/repos/flashcards/src/App.tsx
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
badd +38 ~/repos/flashcards/src/StartMenu/StartMenu.tsx
badd +0 ~/repos/flashcards/src/old-utils/PageStack.ts
badd +0 ~/repos/flashcards/src/old-utils/KeyBinds.ts
badd +0 ~/repos/flashcards/src/old-utils/LpvUtil.ts
badd +0 ~/repos/flashcards/src/old-utils/QpvUtils.ts
badd +0 ~/repos/flashcards/src/old-utils/createList.tsx
badd +0 ~/repos/flashcards/src/old-utils/Read.ts
badd +11 ~/repos/flashcards/src/shared/hooks/useKeyBinds.ts
badd +1 src/components/choose/ChoosePages.tsx
badd +1 src/utils/Read.ts
badd +3 ~/repos/flashcards/src/shared/hooks/useNav.ts
badd +1 ~/repos/flashcards/src/shared/utils/Nav.ts
badd +6 ~/repos/flashcards/src/shared/utils/Write.ts
badd +1 ~/repos/flashcards/src/shared/utils/Read.ts
badd +1 ~/repos/flashcards/src/shared/utils/ProcessArguments.ts
badd +1 ~/repos/flashcards/src/shared/utils/PageStack.ts
badd +1 ~/repos/flashcards/src/shared/utils/PageStack.spec.ts
badd +1 ~/repos/flashcards/src/shared/utils/KeyBinds.ts
badd +12 ~/repos/flashcards/src/shared/hooks/useLoadData.ts
badd +0 ~/repos/flashcards/src/EditQuizzess/Pages.tsx
badd +0 ~/repos/flashcards/src/EditQuizzess/hooks/useAddChoice.ts
badd +0 ~/repos/flashcards/src/EditQuizzess/hooks/useEqt.ts
badd +0 ~/repos/flashcards/src/EditQuizzess/hooks/useLpv.ts
badd +0 ~/repos/flashcards/src/EditQuizzess/hooks/useMcChoices.ts
badd +0 ~/repos/flashcards/src/EditQuizzess/hooks/useMcText.ts
badd +0 ~/repos/flashcards/src/EditQuizzess/hooks/useQABoxes.ts
badd +0 ~/repos/flashcards/src/EditQuizzess/hooks/useQpv.ts
badd +0 ~/repos/flashcards/src/EditQuizzess/utils/LpvUtil.ts
badd +0 ~/repos/flashcards/src/EditQuizzess/utils/QpvUtils.ts
badd +332 ~/repos/flashcards/src/EditQuizzes/EditQuizzesView.tsx
badd +0 ~/repos/flashcards/src/Quiz/QuizMode.tsx
badd +0 ~/repos/flashcards/src/Quiz/FooterKeybinds.tsx
badd +0 ~/repos/flashcards/src/Quiz/MultipleChoice.tsx
badd +0 ~/repos/flashcards/src/Quiz/QuestionAnswer.tsx
badd +0 ~/repos/flashcards/src/Quiz/QuestionInput.tsx
badd +5 ~/repos/flashcards/src/shared/components/LoadingMessage.tsx
badd +15 ~/repos/flashcards/src/shared/components/LoadGate.tsx
badd +1 src/EditQuizzesView/EditQuizzesView.tsx
badd +0 ~/repos/flashcards/src/ChooseQuestions/ChoosePages.tsx
badd +1 ~/repos/flashcards/src/ChooseQuestions/hooks/useChoosePages.ts
badd +0 ~/repos/flashcards/src/ChooseQuestionsView/ChooseQuizView.tsx
badd +174 ~/repos/flashcards/src/ChooseQuestions/ChooseQuestionsView.tsx
badd +1 ~/repos/flashcards/src/shared/components/ShowMode.tsx
badd +1 ~/repos/flashcards/src/EditQuizzes/hooks/useQpv.ts
badd +3 ~/repos/flashcards/src/EditQuizzes/hooks/useQABoxes.ts
badd +3 ~/repos/flashcards/src/EditQuizzes/hooks/useMcText.ts
badd +3 ~/repos/flashcards/src/EditQuizzes/hooks/useMcChoices.ts
badd +5 ~/repos/flashcards/src/EditQuizzes/hooks/useLpv.ts
badd +2 ~/repos/flashcards/src/EditQuizzes/hooks/useEqt.ts
badd +3 ~/repos/flashcards/src/EditQuizzes/hooks/useAddChoice.ts
badd +24 ~/repos/flashcards/src/shared/components/Icons.tsx
argglobal
%argdel
edit ~/repos/flashcards/src/App.tsx
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
balt ~/repos/flashcards/src/ChooseQuestions/ChooseQuestionsView.tsx
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
let s:l = 13 - ((9 * winheight(0) + 20) / 41)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 13
normal! 09|
wincmd w
argglobal
if bufexists(fnamemodify("term://~/repos/flashcards//58422:/usr/bin/zsh;\#toggleterm\#1", ":p")) | buffer term://~/repos/flashcards//58422:/usr/bin/zsh;\#toggleterm\#1 | else | edit term://~/repos/flashcards//58422:/usr/bin/zsh;\#toggleterm\#1 | endif
if &buftype ==# 'terminal'
  silent file term://~/repos/flashcards//58422:/usr/bin/zsh;\#toggleterm\#1
endif
balt ~/repos/flashcards/src/App.tsx
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=0
setlocal fml=1
setlocal fdn=20
setlocal fen
let s:l = 1 - ((0 * winheight(0) + 5) / 10)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 1
normal! 0
wincmd w
2wincmd w
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
let g:this_session = v:this_session
let g:this_obsession = v:this_session
doautoall SessionLoadPost
unlet SessionLoad
" vim: set ft=vim :
