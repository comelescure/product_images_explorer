function createImagePanel(productName, imageUrl, category) {
    const col = document.createElement("div");
    col.className = "col-md-4 custom-col";

    const panel = document.createElement("div");
    panel.className = "panel panel-default";

    const panelHeading = document.createElement("div");
    panelHeading.className = "panel-heading";
    panelHeading.textContent = productName;

    const panelBody = document.createElement("div");
    panelBody.className = "panel-body";

    const img = document.createElement("img");
    img.src = imageUrl;
    img.width = 150;
    img.style.height = '150px'; 

    panelBody.appendChild(img);

    // Ajoutez la catégorie sous l'image si elle est fournie
    if (category) {
        const categoryElement = document.createElement("p");
        categoryElement.textContent = `Breadcrumb : \n${category}`;
        panelBody.appendChild(categoryElement);
    }

    const inputGroup = document.createElement("div");
    inputGroup.className = "input-group";
    inputGroup.style.marginTop = "10px";

    const userInput = document.createElement("input");
    userInput.type = "text";
    userInput.className = "form-control";
    userInput.setAttribute("placeholder", "Ajoutez des informations");

    userInput.addEventListener("change", updateFilterSelect);

    inputGroup.appendChild(userInput);
    panelBody.appendChild(inputGroup);

    const moreImagesButton = document.createElement("button");
    moreImagesButton.className = "btn btn-info";
    moreImagesButton.textContent = "See more images";
    moreImagesButton.style.marginTop = "10px";

    moreImagesButton.addEventListener("click", () => {
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(productName)}&tbm=isch`;
        window.open(searchUrl, '_blank');
    });

    panelBody.appendChild(moreImagesButton);

    const askGPTButton = document.createElement("button");
    askGPTButton.className = "btn btn-info";
    askGPTButton.textContent = "Ask to GPT (Under development)";
    askGPTButton.style.marginTop = "10px";

    askGPTButton.addEventListener("click", async () => {
        const gptResponseUrl = `/ask_gpt?question=${encodeURIComponent("What is this product?")}&product_name=${encodeURIComponent(productName)}`;
    
        try {
            const response = await fetch(gptResponseUrl);
            const data = await response.json();
    
            if (data.response) {
                alert(data.response);
            } else {
                alert("No response from the AI at this time.");
            }
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la récupération de la réponse de l'IA.");
        }
    });

    panelBody.appendChild(askGPTButton);

    panel.appendChild(panelHeading);
    panel.appendChild(panelBody);
    col.appendChild(panel);

    return col;
}



function downloadCSV() {
    const panelHeadings = document.querySelectorAll("#results .panel-heading");
    const allUserInfos = document.querySelectorAll(".form-control");
    const userInfos = Array.from(allUserInfos).slice(1); // Exclut la première zone de texte

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "name,user_info\n";
    csvContent += Array.from(panelHeadings).map((heading, index) => {
        // Ajoutez des guillemets doubles autour des champs contenant des virgules
        return `"${heading.textContent.replace(/"/g, '""')}","${userInfos[index] ? userInfos[index].value.replace(/"/g, '""') : ""}"`;
    }).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "resultats.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function createNotice() {
    const noticeText = `
    Welcome to our image-based product verification tool.
    Enter a list of products, and the tool will generate the first Google image for each product.
    If a product is misclassified, you can correct the category by entering the correct category under the relevant product.
    You can also go to tab 2 to sort the products by category and use Regex.101 to create regular expressions.
    `;
    return noticeText;
}







function getUniqueUserInputs() {
    const userInputs = document.querySelectorAll(".form-control");
    const uniqueInputs = new Set();

    // Ignorer la première zone de texte
    const userInputsArray = Array.from(userInputs).slice(1);

    userInputsArray.forEach(input => {
        if (input.value) {
            uniqueInputs.add(input.value);
        }
    });

    return uniqueInputs;
}

function updateFilterSelect() {
    const uniqueUserInputs = getUniqueUserInputs();
    const filterSelect = document.getElementById("filter-select");

    // Supprime les options existantes
    while (filterSelect.firstChild) {
        filterSelect.removeChild(filterSelect.firstChild);
    }

    // Ajoute une option vide
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Sélectionnez un filtre";
    filterSelect.appendChild(defaultOption);

    // Ajoute les options uniques (ignore les entrées vides)
    uniqueUserInputs.forEach(input => {
        if (input !== "") {
            const option = document.createElement("option");
            option.value = input;
            option.textContent = input;
            filterSelect.appendChild(option);
        }
    });
}



async function handleSearch(event) {
    event.preventDefault();
    const productNames = document.getElementById("product-names").value.split(/\r?\n/).map(name => name.trim()).filter(name => name !== "");

    let breadcrumbs = [];
    if (document.getElementById("provide-breadcrumb").checked) {
        breadcrumbs = document.getElementById("breadcrumbs").value.split(/\r?\n/).map(name => name.trim());
    }

    const results = document.getElementById("results");
    results.innerHTML = "";

    for (let i = 0; i < productNames.length; i++) {
        const productName = productNames[i];
        const cleanedProductName = productName.replace(/\//g, ''); // Supprime les barres obliques
        const response = await fetch(`/get_image_url/${encodeURIComponent(cleanedProductName)}`);
        const data = await response.json();
        const imagePanel = createImagePanel(cleanedProductName, data.image_url, breadcrumbs[i]);
        results.appendChild(imagePanel);
    }

    updateFilterSelect();
}


function redirectToRegex101() {
    const filteredProductNames = document.getElementById("filtered-product-names");
    const productNamesText = filteredProductNames.innerText;
    const encodedProductNames = encodeURIComponent(productNamesText);
    const regex101Url = `https://regex101.com/?#regex=${encodedProductNames}`;
    window.open(regex101Url, '_blank');
}

function displayCategorySearchResults(categories) {
    const categoryResults = $("#category-results");
    categoryResults.empty();
  
    if (categories.length === 0) {
      categoryResults.append('<p class="text-center">Aucune catégorie trouvée.</p>');
      return;
    }
  
    categories.forEach(category => {
      const categoryDiv = $('<div class="col-md-4"></div>');
      const categoryPanel = $('<div class="panel panel-default"></div>');
      const categoryPanelHeading = $('<div class="panel-heading"></div>');
      const categoryPanelBody = $('<div class="panel-body"></div>');
  
      categoryPanelHeading.text(category);
      categoryPanel.append(categoryPanelHeading);
      categoryPanel.append(categoryPanelBody);
      categoryDiv.append(categoryPanel);
      categoryResults.append(categoryDiv);
    });
  }

  function displayCategories(categories) {
    const container = document.querySelector("#categoryTree");
    categories.forEach(category => {
        const categoryElement = document.createElement("div");
        categoryElement.textContent = category;

        const granularities = category.split('_');
        categoryElement.className = `granularity-${granularities.length - 1}`;

        container.appendChild(categoryElement);
    });
}


function convertCategoriesToHierarchy(categories) {
    const hierarchy = {};

    categories.forEach(category => {
        const levels = category.split('_');

        let currentLevel = hierarchy;

        levels.forEach(level => {
            if (!currentLevel[level]) {
                currentLevel[level] = {
                    name: level,
                    subcategories: {}
                };
            }

            currentLevel = currentLevel[level].subcategories;
        });
    });

    return hierarchy;
}

function flattenHierarchy(hierarchy) {
    const categories = [];

    function traverse(node, path = []) {
        categories.push({
            name: node.name,
            subcategories: Object.values(node.subcategories)
        });

        path.push(node.name);

        Object.values(node.subcategories).forEach(subcategory => {
            traverse(subcategory, path);
        });

        path.pop();
    }

    traverse(hierarchy);

    return categories;
}





document.getElementById("search-form").addEventListener("submit", handleSearch);
document.getElementById("download-button").addEventListener("click", downloadCSV);

document.getElementById("filter-select").addEventListener("change", function (event) {
    const filter = event.target.value;
    const filteredProductNames = document.getElementById("filtered-product-names");
    filteredProductNames.innerHTML = "";

    if (filter === "") {
        return;
    }

    const productNames = document.getElementById("product-names").value.split("\n").map(name => name.trim());
    const userInfos = document.querySelectorAll(".form-control");

    // Ignorer la première zone de texte 
    const userInfosArray = Array.from(userInfos).slice(1);

    productNames.forEach((productName, index) => {
        if (userInfosArray[index].value === filter) {
            const nameElement = document.createElement("p");
            nameElement.textContent = productName;
            filteredProductNames.appendChild(nameElement);
        }
    });
});
document.getElementById('regex-test-button').addEventListener('click', function() {
    const productNames = document.getElementById('filtered-product-names').innerText;
    const regex101Url = `https://regex101.com/?regex=&testString=${encodeURIComponent(productNames)}&flags=&subst=&delimiter=`;

    window.open(regex101Url, '_blank');
});

document.getElementById("notice").innerHTML = createNotice();

async function loadCategories() {
    const response = await fetch('/static/categories.json');
    const categories = await response.json();
    const hierarchy = convertCategoriesToHierarchy(categories);
    const hierarchicalCategories = flattenHierarchy(hierarchy);
    const container = document.querySelector("#categoryTree");
    displayCategories(hierarchicalCategories, container);
}


document.getElementById("category-search").addEventListener("input", function (event) {
    const searchQuery = event.target.value.toLowerCase();
    const filteredCategories = categories.filter(category => category.toLowerCase().includes(searchQuery));
    displayCategorySearchResults(filteredCategories);
});


loadCategories();

document.getElementById("provide-breadcrumb").addEventListener("change", function (event) {
    const breadcrumbInputGroup = document.getElementById("breadcrumb-input-group");
    if (event.target.checked) {
        breadcrumbInputGroup.style.display = "block";
    } else {
        breadcrumbInputGroup.style.display = "none";
    }
});
