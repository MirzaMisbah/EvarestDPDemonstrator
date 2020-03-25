const uiAdapter = new tucana.adapter.DOMUIAdapter(document.getElementById("main-place"));
fetch("smart_service.json").then(response=>{
    return response.json();
}).then(json=>{
    uiAdapter.showService(json);
    uiAdapter.showYoutubeVideo("Test Integer Visualizer0","Q21E2xQngy8",true,33);
})
