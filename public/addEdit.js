import { enableInput, inputEnabled, message, setDiv, token } from "./index.js";
import { showMovies } from "./movies.js";

let addEditDiv = null;
let title = null;
let director = null;
let year = null;
let plot = null;
let addingMovie = null;

export const handleAddEdit = () => {
    addEditDiv = document.getElementById("edit-movie");
    title = document.getElementById("title");
    director = document.getElementById("director");
    year = document.getElementById("year");
    plot = document.getElementById("plot");
    addingMovie = document.getElementById("adding-movie");
    const editCancel = document.getElementById("edit-cancel");

    addEditDiv.addEventListener("click", async (e) => {
        if (inputEnabled && e.target.nodeName === "BUTTON") {
            if (e.target === addingMovie) {
                enableInput(false);

                let method = "POST";
                let url = "/api/v1/movies";
                if (addingMovie.textContent === "update") {
                    method = "PATCH";
                    url = `/api/v1/movies/${addEditDiv.dataset.id}`;
                }
                try {
                    const response = await fetch(url, {
                        method: method,
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            title: title.value,
                            director: director.value,
                            year: year.value,
                            plot: plot.value,
                        }),
                    });

                    const data = await response.json();
                    if (response.status === 200 || response.status === 201) {
                        if (response.status === 200) {
                            // 200 indicates a successful update
                            message.textContent = "The movie entry was updated.";
                        } else {
                            // 201 indicates a successful create
                            message.textContent = "The movie entry was created.";
                        }

                        title.value = "";
                        director.value = "";
                        year.value = "";
                        plot.value = "";

                        showMovies();
                    } else {
                        message.textContent = data.msg;
                    }
                } catch (err) {
                    console.log(err);
                    message.textContent = "A communication error occurred.";
                }

                enableInput(true);
            } else if (e.target === editCancel) {
                message.textContent = "";
                showMovies();
            }
        }
    });
};

export const showAddEdit = async (movieId) => {
    if (!movieId) {
        title.value = "";
        director.value = "";
        year.value = "";
        plot.value = "";
        addingMovie.textContent = "add";
        message.textContent = "";

        setDiv(addEditDiv);
    } else {
        enableInput(false);

        try {
            const response = await fetch(`/api/v1/movies/${movieId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (response.status === 200) {
                title.value = data.movie.title;
                director.value = data.movie.director;
                year.value = data.movie.year;
                plot.value = data.movie.plot;
                addingMovie.textContent = "update";
                message.textContent = "";
                addEditDiv.dataset.id = movieId;

                setDiv(addEditDiv);
            } else {
                // might happen if the list has been updated since last display
                message.textContent = "The movie entry was not found.";
                showMovies();
            }
        } catch (err) {
            console.log(err);
            message.textContent = "A communications error has occurred.";
            showMovies();
        }

        enableInput(true);
    }


};


export const handleDeleteMovie = async (moveId) => {
    enableInput(false);
    try {
        const url = `/api/v1/movies/${moveId}`;

        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },

        });

        const data = await response.json();

        if(response === 200) {
            message.textContent = data.msg;
            showMovies();
        } else {
            message.textContent = data.msg;
            showMovies();
        }
    } catch (err) {
        console.log(err);
        message.textContent = "A communications error has occurred.";
        showMovies();
    }
    enableInput(true);
};
