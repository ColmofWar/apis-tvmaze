"use strict";

const $showsList = $("#showsList");
const $episodesList = $("#episodesList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  // input search term. searches api and itterates results into a objects show{id, name, summary, image}
  const res = await axios.get("http://api.tvmaze.com/search/shows",{ params: {q: term}});
  let results = res.data.map(result => {
    const show = result.show;
    return{
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: show.image ? show.image.medium : "https://tinyurl.com/tv-missing",
    }
    
  })
  return(results);
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();
  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="Bletchly Circle San Francisco"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */
async function getEpisodesAndDisplay(e){
  // Handles retreiving episodes base on which button was clicked and appends episode list
  const showId = $(e.target).closest(".Show").data("show-id");
  const episodeList = await getEpisodesOfShow(showId);
  populateEpisodes(episodeList);

}


function populateEpisodes(episodes){
  // input episodes object episodes{}, appends episodes list 
  $episodesList.empty();
  for (let episode of episodes) {
    const $episode = $(
      `<li>Season ${episode.season}, Ep. ${episode.number}: ${episode.name}</li>`);
  $episodesList.append($episode)
  $episodesArea.show();
  }
}

async function getEpisodesOfShow(id) {
  // input show ID, send get to api, return episode {id, name, season, number} 
  const res = await axios.get("http://api.tvmaze.com/shows/" + id + "/episodes")
  console.log(res);
  let episodes = res.data.map(episode => {
   return{
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number,
   }
  })
  return episodes;
}

// event listener for episodes button
$showsList.on("click", ".Show-getEpisodes", getEpisodesAndDisplay);

