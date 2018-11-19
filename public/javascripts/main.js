const getNewQuote = () => {
  fetch('/api/v1/generate-changing-life-quote', {
    method: 'post',
    "Accept":"text/html"
  }).then((res)=>res.text()).then((res)=>{
    document.getElementById("quote").innerHTML= res;
  })
}