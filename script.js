// Айналу жылдамдығының бастапқы мәні
let speed = 10;
let rotationElement = document.querySelector(".circle-svg");
let textElement = document.querySelector("#rotatingText");

// Түстер тізімі
let colors = ["lightgreen", "red", "blue", "yellow", "white"];
let colorIndex = 0;

// Жылдамдықты арттыру
function increaseSpeed() {
    speed = Math.max(2, speed - 2); // Мин. 2 секунд
    updateRotation();
}

// Жылдамдықты азайту
function decreaseSpeed() {
    speed = Math.min(20, speed + 2); // Макс. 20 секунд
    updateRotation();
}

// Түсті өзгерту (кезекпен ауысады)
function changeColor() {
    colorIndex = (colorIndex + 1) % colors.length;
    textElement.setAttribute("fill", colors[colorIndex]);
}

// Айналу жылдамдығын жаңарту
function updateRotation() {
    rotationElement.style.animation = `rotateText ${speed}s linear infinite`;
}

// Файлдарды сақтау массиві
let uploadedFiles = [];

// Файлды жүктеу
async function uploadFile() {
    let fileInput = document.getElementById("fileInput");
    if (fileInput.files.length === 0) {
        alert("выберите файл!");
        return;
    }

    let formData = new FormData();
    formData.append("file", fileInput.files[0]);

    let response = await fetch("http://localhost:3000/upload", {
        method: "POST",
        body: formData
    });

    if (response.ok) {
        alert("Файл устоновлено!");
        loadFiles();
    } else {
        alert("не устоновлено!");
    }
}

async function loadFiles() {
    try {
        let response = await fetch("http://localhost:3000/files");
        if (!response.ok) throw new Error("Файлдарды жүктеу сәтсіз аяқталды.");
        
        let files = await response.json();
        let fileList = document.getElementById("fileList");
        fileList.innerHTML = "";

        files.forEach(file => {
            let listItem = document.createElement("li");

            // Файл сілтемесін жасау
            let link = document.createElement("a");
            link.href = "http://localhost:3000" + file.url;
            link.textContent = file.name;
            link.target = "_blank";

            // Өшіру батырмасын жасау
            let deleteButton = document.createElement("button");
            deleteButton.textContent = "удалить";
            deleteButton.classList.add("delete-btn");

            deleteButton.onclick = async function () {
                let code = prompt("Кодты енгізіңіз:"); // Код сұрау
                if (code !== "nurs") {
                    alert("Қате код! Файл жойылмады.");
                    return;
                }

                try {
                    let deleteResponse = await fetch(`http://localhost:3000/delete/${file.id}`, {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ code: code })
                    });

                    if (deleteResponse.ok) {
                        alert("Файл сәтті өшірілді!");
                        listItem.remove(); // HTML тізімнен өшіру
                    } else {
                        alert("Файлды өшіру кезінде қате пайда болды.");
                    }
                } catch (error) {
                    alert("Серверге қосылу мүмкін емес.");
                    console.error(error);
                }
            };

            listItem.appendChild(link);
            listItem.appendChild(deleteButton);
            fileList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Қате:", error);
        alert("Файлдарды жүктеу мүмкін емес.");
    }
}

// Файлдарды жүктеу
loadFiles();
