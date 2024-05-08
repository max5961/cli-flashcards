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
badd +36 src/components/create/Pages.tsx
badd +3 src/utils/PageStack.ts
badd +136 ~/repos/flashcards/src/utils/KeyBinds.ts
badd +7 src/hooks/useLpv.ts
badd +10 ~/repos/flashcards/src/components/shared/InputBox.tsx
badd +12 ~/repos/flashcards/src/App.tsx
badd +25 ~/repos/flashcards/src/hooks/useNav.ts
badd +1 ~/repos/flashcards/src/hooks/useStdoutDimensions.ts
badd +91 ~/repos/flashcards/src/hooks/useWindow.tsx
badd +1 src/hooks/useStdInput.ts
badd +1 ~/repos/flashcards/src/hooks/useKeyBinds.ts
badd +21 ~/repos/flashcards/src/utils/LpvUtil.ts
badd +222 ~/repos/flashcards/src/utils/QpvUtils.ts
badd +1 ~/repos/flashcards/src/hooks/useQpv.ts
badd +80 ~/repos/flashcards/src/utils/Nav.ts
badd +35 ~/repos/flashcards/src/hooks/useEqt.ts
badd +34 ~/repos/flashcards/src/hooks/useQABoxes.ts
badd +47 src/hooks/useAddChoice.ts
badd +19 Session.vim
badd +36 ~/repos/flashcards/src/hooks/useMcChoices.ts
badd +1 ~/repos/flashcards/src/utils/useMcText.ts
badd +26 ~/repos/flashcards/src/components/start/StartMenu.tsx
badd +16 ~/repos/flashcards/src/components/shared/FocusableBox.tsx
badd +1 src/utils/createList.tsx
badd +100 ~/repos/flashcards/src/components/choose/ChoosePages.tsx
badd +11 src/types.ts
badd +1 ~/repos/flashcards/src/components/choose/useChoosePages.ts
badd +51 src/utils/Read.ts
argglobal
%argdel
edit ~/repos/flashcards/src/components/choose/ChoosePages.tsx
let s:save_splitbelow = &splitbelow
let s:save_splitright = &splitright
set splitbelow splitright
let &splitbelow = s:save_splitbelow
let &splitright = s:save_splitright
wincmd t
let s:save_winminheight = &winminheight
let s:save_winminwidth = &winminwidth
set winminheight=0
set winheight=1
set winminwidth=0
set winwidth=1
argglobal
balt ~/repos/flashcards/src/utils/KeyBinds.ts
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
let s:l = 100 - ((19 * winheight(0) + 20) / 41)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 100
normal! 048|
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
