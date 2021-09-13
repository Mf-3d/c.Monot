function searchBrowser(){
  let word=document.getElementsByTagName('input')[0].value;
  location.href=`https://www.google.co.jp/search?q=${word}`;
}
document.getElementsByTagName('input')[0].addEventListener('keydown',(e)=>{
  let word=document.getElementsByTagName('input')[0].value;
  if(e.keyCode==13&&word!=null){
    location.href=`https://www.google.co.jp/search?q=${word}`;
  }
})
