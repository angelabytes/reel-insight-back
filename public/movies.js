import {
  inputEnabled,
  setDiv,
  message,
  setToken,
  token,
  enableInput,
} from "./index.js";
import { showLoginRegister } from "./loginRegister.js";
import { showAddEdit, handleDeleteMovie} from "./addEdit.js";

let moviesDiv = null;
let moviesTable = null;
let moviesTableHeader = null;


export const handleMovies = () => {
  moviesDiv = document.getElementById("movies");
  const logoff = document.getElementById("logoff");
  const addMovie = document.getElementById("add-movie");
  moviesTable = document.getElementById("movies-table");
  moviesTableHeader = document.getElementById("movies-table-header");

  moviesDiv.addEventListener("click", (e) => {
    if (inputEnabled && e.target.nodeName === "BUTTON") {
      if (e.target === addMovie) {
        showAddEdit(null);
      } else if (e.target === logoff) {
        
        setToken(null);

        message.textContent = "You have been logged off.";

        moviesTable.replaceChildren([moviesTableHeader]);

        showLoginRegister();
      } else if (e.target.classList.contains("editButton")) {

        message.textContent = "";

        showAddEdit(e.target.dataset.id);

      } else if (e.target.classList.contains("deleteButton")) {
        const movieToDelete = e.target.dataset.id;
        message.textContent = "";
        if(movieToDelete) {
          handleDeleteMovie(movieToDelete);
          
        } else {
          message.textContent = "Error: Could not delete movie with that id.";
        }
      }
    } 
  });
};

export const showMovies = async () => {
   try {
    enableInput(false);

    const response = await fetch("/api/v1/movies", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    let children = [moviesTableHeader];

    if (response.status === 200) {
      if (data.count === 0) {
        moviesTable.replaceChildren(...children); // clear this for safety
      } else {
        for (let i = 0; i < data.movies.length; i++) {
          let rowEntry = document.createElement("tr");

          let editButton = `<td><button type="button" class="editButton" data-id=${data.movies[i]._id}>edit</button></td>`;
          let deleteButton = `<td><button type="button" class="deleteButton" data-id=${data.movies[i]._id}>delete</button></td>`;
          let rowHTML = `
            <td>${data.movies[i].title}</td>
            <td>${data.movies[i].director}</td>
            <td>${data.movies[i].year}</td>
            <td>${data.movies[i].plot}</td>
            <div>${editButton}${deleteButton}</div>`;

          rowEntry.innerHTML = rowHTML;
          children.push(rowEntry);
        }
        moviesTable.replaceChildren(...children);
      }
    } else {
      message.textContent = data.msg;
    }
  } catch (err) {
    console.log(err);
    message.textContent = "A communication error occurred.";
  }
  enableInput(true);
  setDiv(moviesDiv);
};   