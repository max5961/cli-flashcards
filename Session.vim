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
badd +61 src/root.tsx
badd +21 src/App.tsx
badd +235 src/Components/createMode/CreateNew.tsx
badd +22 src/Components/quizMode/QuestionInput.tsx
badd +21 src/interfaces.ts
badd +77 src/Components/createMode/useWindow.tsx
badd +15 ~/repos/flashcards/src/readDir.ts
badd +1 ~/repos/flashcards/src/Components/quizMode/MultipleChoice.tsx
badd +1 ~/repos/flashcards/src/Components/quizMode/QuestionAnswer.tsx
badd +1 ~/repos/flashcards/src/Components/quizMode/QuizMode.tsx
badd +1 ~/repos/flashcards/src/Components/quizMode/FooterKeybinds.tsx
badd +7 ~/repos/flashcards/src/Components/quizMode/Header.tsx
badd +1 ~/repos/flashcards/src/Components/Lines.tsx
badd +327 ~/repos/flashcards/src/Components/createMode/classes.ts
badd +1 src/Components/createMode/pageStack.ts
badd +38 ~/repos/flashcards/src/keybinds.ts
badd +4 ~/repos/flashcards/node_modules/ink/build/hooks/use-input.d.ts
argglobal
%argdel
$argadd src/root.tsx
edit src/Components/createMode/CreateNew.tsx
argglobal
balt ~/repos/flashcards/src/Components/createMode/classes.ts
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
let s:l = 125 - ((12 * winheight(0) + 26) / 52)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 125
normal! 0
tabnext 1
if exists('s:wipebuf') && len(win_findbuf(s:wipebuf)) == 0 && getbufvar(s:wipebuf, '&buftype') isnot# 'terminal'
  silent exe 'bwipe ' . s:wipebuf
endif
unlet! s:wipebuf
set winheight=1 winwidth=20
let &shortmess = s:shortmess_save
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
