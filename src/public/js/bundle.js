/* eslint-disable */ /* eslint-disable */ /* eslint-disable */ const $148ff6bf92e6607d$export$516836c6a9dfc573 = ()=>{
    const el = document.querySelector(".alert");
    if (el) el.remove();
};
const $148ff6bf92e6607d$export$de026b00723010c1 = (type, msg)=>{
    const markup = `<div class='alert alert--${type}'>${msg}</div>`;
    document.querySelector("body").insertAdjacentHTML("afterbegin", markup);
};


const $0c93b98d89d43bc4$export$596d806903d1f59e = async (email, password)=>{
    try {
        const response = await fetch("/api/v1/users/login", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        const result = await response.json();
        if (result.status === "success") {
            (0, $148ff6bf92e6607d$export$de026b00723010c1)("success", "Logged In Successfully");
            window.setTimeout(()=>{
                location.assign("/");
            }, 1500);
        } else {
            (0, $148ff6bf92e6607d$export$de026b00723010c1)("error", result.message);
            setTimeout((0, $148ff6bf92e6607d$export$516836c6a9dfc573), 2000);
        }
    } catch (error) {
        (0, $148ff6bf92e6607d$export$de026b00723010c1)("error", "Something went wrong");
    }
};
const $0c93b98d89d43bc4$export$a0973bcfe11b05c9 = async ()=>{
    try {
        const response = await fetch("/api/v1/users/logout");
        const result = await response.json();
        if (result.status === "success") {
            (0, $148ff6bf92e6607d$export$de026b00723010c1)("success", "Logged out Successfully");
            setTimeout(()=>{
                location.reload(true); // NOTE: force reload from the server, instead of reloading it from browser cache
                location.assign("/");
            }, 1500);
        }
    } catch (error) {
        (0, $148ff6bf92e6607d$export$de026b00723010c1)("error", "Something went wrong");
    }
};


/* eslint-disable */ const $d1d09e4c86005dbc$var$handleResponse = (result)=>{
    if (result.status === "success") {
        showAlert("success", "Updated Successfully");
        window.setTimeout(()=>{
            location.assign("/me");
        }, 1500);
    } else {
        showAlert("error", result.message);
        setTimeout(hideAlert, 2000);
    }
};
const $d1d09e4c86005dbc$var$fetchData = async (url, data)=>{
    const response = await fetch(url, {
        method: "PATCH",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    const result = await response.json();
    return result;
};
const $d1d09e4c86005dbc$export$3bf0495508a61ee = async (data, type)=>{
    try {
        let response;
        if (type === "data") response = await $d1d09e4c86005dbc$var$fetchData("/api/v1/users/me", data);
        else if (type === "password") response = await $d1d09e4c86005dbc$var$fetchData("/api/v1/users/update-password", data);
        $d1d09e4c86005dbc$var$handleResponse(response);
    } catch (error) {
        showAlert("error", "Something went wrong");
    }
};


/* eslint-disable */ const $ebc7adaa20a7299a$export$4c5dd147b21b9176 = (locations)=>{
    mapboxgl.accessToken = "pk.eyJ1IjoiYWJvemFpZDAxIiwiYSI6ImNsbDU5eTloMzAzOTYza3Fqb3Q4Z2NscmoifQ.sDPpBLaTQFIKJcXSKFAshQ";
    const map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/abozaid01/clsapb3oq00t101qlhmte2ekx",
        scrollZoom: false
    });
    const bounds = new mapboxgl.LngLatBounds();
    locations.forEach((loc)=>{
        // Create marker
        const el = document.createElement("div");
        el.className = "marker";
        // Add marker
        new mapboxgl.Marker({
            element: el,
            anchor: "bottom"
        }).setLngLat(loc.coordinates).addTo(map);
        // Add popup
        new mapboxgl.Popup({
            offset: 30
        }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map);
        // Extend map bounds to include current location
        bounds.extend(loc.coordinates);
    });
    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    });
};


// DOM Elements
const $cd96a261012e2483$var$loginForm = document.querySelector(".form--login");
const $cd96a261012e2483$var$logoutBtn = document.querySelector(".nav__el--logout");
const $cd96a261012e2483$var$settingForm = document.querySelector(".form-user-data");
const $cd96a261012e2483$var$passwordForm = document.querySelector(".form-user-password");
const $cd96a261012e2483$var$map = document.getElementById("map");
if ($cd96a261012e2483$var$loginForm) $cd96a261012e2483$var$loginForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    (0, $0c93b98d89d43bc4$export$596d806903d1f59e)(email, password);
});
if ($cd96a261012e2483$var$logoutBtn) $cd96a261012e2483$var$logoutBtn.addEventListener("click", (0, $0c93b98d89d43bc4$export$a0973bcfe11b05c9));
if ($cd96a261012e2483$var$settingForm) $cd96a261012e2483$var$settingForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    (0, $d1d09e4c86005dbc$export$3bf0495508a61ee)({
        name: name,
        email: email
    }, "data");
});
if ($cd96a261012e2483$var$passwordForm) $cd96a261012e2483$var$passwordForm.addEventListener("submit", async (e)=>{
    e.preventDefault();
    document.querySelector(".btn--save-password").textContent = "Updating...";
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("password-confirm").value;
    const currentPassword = document.getElementById("password-current").value;
    await (0, $d1d09e4c86005dbc$export$3bf0495508a61ee)({
        password: password,
        passwordConfirm: passwordConfirm,
        currentPassword: currentPassword
    }, "password");
    document.querySelector(".btn--save-password").textContent = "Save password";
    document.getElementById("password-current").value = "";
    document.getElementById("password").value = "";
    document.getElementById("password-confirm").value = "";
});
if ($cd96a261012e2483$var$map) {
    const locations = JSON.parse($cd96a261012e2483$var$map.dataset.locations);
    (0, $ebc7adaa20a7299a$export$4c5dd147b21b9176)(locations);
}


