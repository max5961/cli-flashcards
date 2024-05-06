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
badd +134 src/components/create/Pages.tsx
badd +269 src/utils/PageStack.ts
badd +61 ~/repos/flashcards/src/utils/KeyBinds.ts
badd +31 src/hooks/useLpv.ts
badd +21 ~/repos/flashcards/src/components/shared/InputBox.tsx
badd +8 ~/repos/flashcards/src/App.tsx
badd +12 ~/repos/flashcards/src/hooks/useNav.ts
badd +1 ~/repos/flashcards/src/hooks/useStdoutDimensions.ts
badd +1 ~/repos/flashcards/src/hooks/useWindow.tsx
badd +1 src/hooks/useStdInput.ts
badd +1 ~/repos/flashcards/src/hooks/useKeyBinds.ts
badd +1 ~/repos/flashcards/src/utils/LpvUtil.ts
badd +0 ~/repos/flashcards/src/utils/QpvUtils.ts
argglobal
%argdel
edit ~/repos/flashcards/src/utils/QpvUtils.ts
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
balt ~/repos/flashcards/src/hooks/useNav.ts
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
let s:l = 1 - ((0 * winheight(0) + 20) / 41)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 1
normal! 0
wincmd w
argglobal
if bufexists(fnamemodify("term://~/repos/flashcards//69012:/usr/bin/zsh;\#toggleterm\#1", ":p")) | buffer term://~/repos/flashcards//69012:/usr/bin/zsh;\#toggleterm\#1 | else | edit term://~/repos/flashcards//69012:/usr/bin/zsh;\#toggleterm\#1 | endif
if &buftype ==# 'terminal'
  silent file term://~/repos/flashcards//69012:/usr/bin/zsh;\#toggleterm\#1
endif
balt ~/repos/flashcards/src/utils/LpvUtil.ts
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=0
setlocal fml=1
setlocal fdn=20
setlocal fen
let s:l = 23 - ((9 * winheight(0) + 5) / 10)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 23
normal! 056|
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
let g:this_session = v:this_session
let g:this_obsession = v:this_session
doautoall SessionLoadPost
unlet SessionLoad
" vim: set ft=vim :
