const $findDialog = document.getElementById('find-dialog');
const $searchDialog = document.getElementById('search-dialog');
const $find = $searchDialog.querySelector(':scope > .layout-content > .search-container > .search-form > .label > .bookTitle');
const $loading = document.body.querySelector(':scope > .loading');
const $lists = $findDialog.querySelector(':scope > .content > .list');
const $totalCount = $findDialog.querySelector(':scope > .content > .total-count');
const $bestSearch = $searchDialog.querySelector(':scope > .layout-content > .rank-container');
const $bestBookItems = $bestSearch.querySelector(':scope > .show-ranks > .list');
const $contentBox = $searchDialog.querySelector(':scope > .layout-content > .popular-container > .content-box');

const apiKey = '8Lk0MkLHo573DCbWLuJXqkh3aCtUK5vbm1NPP%2B13GqQzF9DXlFtKmZEy0iVPtqoWQHnKh6j6gsaEpDTdrXZJVg%3D%3D';
const restApiKey = 'fa8fbe051d67927bcc168a007e37a73b';
const hideLoading = () => $loading.classList.remove('visible');
const showLoading = () => $loading.classList.add('visible');
const hideDialog = () => $findDialog.classList.remove('visible');
const showDialog = () => $findDialog.classList.add('visible');


$findDialog.querySelector(':scope > .close').onclick = () => {
    hideDialog()
    $find.value = '';
};

$searchDialog.querySelector(':scope > .layout-content > .search-container > .search-form').onsubmit = (e) => {
    e.preventDefault();
    const bookTitle = $find.value.trim();
    if (bookTitle.length < 1) {
        alert('검색할 책을 입력해주세요.');
        return;
    }
    fetchBookData(bookTitle);
};

const sortValue = $findDialog.querySelector(':scope > .content > .sort-form > .label');
const $select = sortValue.querySelector(':scope > select[name="select"]');
$select.addEventListener('change', (e) => {
    const sortValue = e.target.value;
    fetchBookData($find.value.trim(), sortValue);
});

function fetchBookData(bookTitle, sortType) {
    if (!bookTitle) return;

    const url = new URL('https://dapi.kakao.com/v3/search/book');
    url.searchParams.set('query', bookTitle);
    url.searchParams.set('size', '10');
    url.searchParams.set('sort', sortType);

    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;
        hideLoading();
        if (xhr.status < 200 || xhr.status >= 400) {
            alert('검색 요청 실패');
            return;
        }

        const response = JSON.parse(xhr.responseText);
        const books = response.documents;
        const totalCount = response.meta.total_count;
        console.log(response);
        renderBooks(books, totalCount);
        showDialog();
    };

    xhr.open('GET', url.toString());
    xhr.setRequestHeader('Authorization', `KakaoAK ${restApiKey}`);
    xhr.send();
    showLoading();
}

function renderBooks(books, totalCount) {
    $lists.querySelectorAll('.book').forEach((item) => {
        item.remove();
    })
    $lists.innerHTML = '';
    $totalCount.innerHTML = '';
    for (const book of books) {
        const translator = book.translators.length > 0 ? book.translators : '없음';
        const html = `
                    <li class="book">
                        <span class="image">
                            <span class="thumbnail">
                                <img class="img" src="${book['thumbnail']}" alt="">
                            </span>
                        </span>
                        <span class="stretch"></span>
                        <span class="detail">
                            <span class="title-info">
                                 <h3><span class="title">${book['title']}</span></h3>
                            </span>
                            <span class="author-info">
                                <span class="common">저자:</span>
                                <span class="author">${book['authors']}</span>
                                <span class="common">출판사:</span>
                                <span class="publisher">${book['publisher']}</span>
                            </span>                          
                            <span class="translator-info">
                                <span class="common">번역가:</span>
                                <span class="translator">${translator}</span>
                                <span class="common">발간일:</span>
                                <span class="date-time">${book['datetime'].substring(0, 10)}</span>                           
                            </span>
                            <span class="price">
                                <span class="common">가격:</span>
                                <span>${book['price']}원</span>
                        </span>
                    </li>
                    `
        $lists.innerHTML += html;
    }
    $totalCount.innerHTML += `
        <span>"${$find.value}"에 대한 결과:${totalCount}건</span>
    `;
}

function rankList() {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;
        if (xhr.status < 200 || xhr.status >= 400) {
            alert('요청 실패');
            return;
        }

        const response = JSON.parse(xhr.responseText);
        console.log(response)
        const datas = response.response.body.items.item;
        console.log(datas)
        let rankTitle = [];

        $contentBox.innerHTML = "";
        $bestBookItems.innerHTML = "";

        for (const data of datas) {
            let li = document.createElement("li");
            let img = document.createElement("img");
            img.classList.add("img");
            img.alt = "책 이미지";
            img.src = "./assets/images/loading.png";

            if (data['rank'] <= 3) {
                li.classList.add("page");
                li.innerHTML = `
                    <span class="rank">${data['rank']}</span>
                    <span class="title">${data['search_word']}</span>
                `;
                li.prepend(img);
                $contentBox.appendChild(li);
            } else {
                li.classList.add("item");
                li.innerHTML = `
                    <span class="rank">${data['rank']}</span>
                    <span class="title">${data['search_word']}</span>
                `;
                li.prepend(img);
                $bestBookItems.appendChild(li);
            }
            rankTitle.push({title: data['search_word'], img: img});
        }
        for (const item of rankTitle) {
            getSearchImg(item.title, item.img);
        }
    };
    const url = `https://apis.data.go.kr/6260000/BookSearchWordBestService/getBookSearchWordBest?serviceKey=${apiKey}&numOfRows=10&pageNo=1&lib_name=0&resultType=json`;
    xhr.open('GET', url);
    xhr.send();
}

rankList();

function getSearchImg(rankTitle, img) {
    const url = `https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(rankTitle)}&size=1`;

    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;
        if (xhr.status < 200 || xhr.status >= 400) {
            return;
        }

        const data = JSON.parse(xhr.responseText);
        if (data.documents.length > 0 && data.documents[0].thumbnail) {
            img.src = data.documents[0].thumbnail;
        }
    };

    xhr.open("GET", url);
    xhr.setRequestHeader("Authorization", `KakaoAK ${restApiKey}`);
    xhr.send();
}

document.addEventListener("click", (e) => {
    const target = e.target.closest(".page, .item");
    if (!target) return;

    const titleElement = target.querySelector(".title");
    if (!titleElement) return;

    const title = titleElement.innerText.trim();
    $find.value = title;
    console.log(title);


    fetchBookData(title);
});

const $mapContainer = document.getElementById('map-container');
const $map = $mapContainer.querySelector(':scope>.map');
const $close = $mapContainer.querySelector(':scope>.button.close');
const showMapDialog = () => $mapContainer.classList.add('visible');
const hideMapDialog = () => $mapContainer.classList.remove('visible');

const mapInstance = new kakao.maps.Map($map,
    {
        center: new kakao.maps.LatLng(35.8655753, 128.59339),
        level: 3,
    }
    //처음에 지도를 열었을때 표시해주는 위도와경도를 정해서 띄워준다.
);

const input = $mapContainer.querySelector(':scope>.location-search>.label>.book-title');
document.getElementById('confirm').onclick = () => {
    showMapDialog();
    currentLocation();
}

$close.onclick = () => {
    hideMapDialog();
}

let currentMarker;

const currentInfoWindow = new kakao.maps.InfoWindow({
    content: '<div style="width: 150px; text-align: center; padding: 0.5rem 1rem;background-color:deepskyblue; color: #ffffff;">현위치</div>'
})
let lat;
let lng;

function currentLocation() {
    //navigator.geolocation를 사용해 현재 위치를 작성할 수 있다.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            lat = position.coords.latitude;//현재 위치의 위도
            lng = position.coords.longitude;//현재 위치의 경도
            let locPosition = new kakao.maps.LatLng(lat, lng);
            //현재 위치의 위도와 경도를 지정.
            mapInstance.setCenter(locPosition);
            mapInstance.setLevel(3);

            currentMarker = new kakao.maps.Marker({
                map: mapInstance,
                position: locPosition,
            })
            currentInfoWindow.open(mapInstance, currentMarker);
        })
    }
}


const mapInput = $mapContainer.querySelector('.location-search>.label>.book-title')
$mapContainer.querySelector('.location-search>.find').onclick = (e) => {
    e.preventDefault();
    findLocation(mapInput.value);
}

const libList = $mapContainer.querySelector(':scope>.library-list');
const libDetail = $mapContainer.querySelector(':scope>.library-detail');
let polyline;


const tMapAppKey = 'CmF0Mf2K1naapU2ohPJuE2b1KTjEph5P6jgEEgQn';
const tmapUrl = 'https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1';
const pedestrianNavi = $mapContainer.querySelector(':scope>.pedestrian-navi');

function findLocation(destination) {
    const xhr = new XMLHttpRequest();
    const bounds = new kakao.maps.LatLngBounds();// 지도 범위 조정용.
    const libraryList = '';
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        hideLoading();
        if (xhr.status < 200 || xhr.status >= 400) {
            alert('요청 실패');
            return;
        }
        const response = JSON.parse(xhr.responseText);
        const places = response.documents;
        console.log(places);
        if (places.length === 0) {
            alert("검색결과가 없다.");
        }
        libList.innerHTML = '';
        for (let i = 0; i < places.length; i++) {
            const place = places[i];
            const position = new kakao.maps.LatLng(place.y, place.x);
            bounds.extend(position);
            const marker = new kakao.maps.Marker({
                map: mapInstance,//marker를 어디 지도에 띄울지 정하기 위함.
                position: position
            })


            const infoWindow = new kakao.maps.InfoWindow(
                {
                    content: `<div style="width:15rem; padding:0.5rem 0.5rem;text-align: center;">${place.place_name}<br>
                              </div>`
                }
            );
            kakao.maps.event.addListener(marker, 'click', () => {

            })

            let span = document.createElement('span');
            span.classList.add('detail')
            span.innerHTML = `
            <h3>${place.place_name}</h3>
            `
            kakao.maps.event.addListener(marker, 'mouseover', () => {
                infoWindow.open(mapInstance, marker);
            });
            kakao.maps.event.addListener(marker, 'mouseout', () => {
                infoWindow.close(mapInstance, marker);
            });
            libList.classList.add('visible');
            libList.append(span);

            span.addEventListener('click', () => {
                const bounds = new kakao.maps.LatLngBounds();
                let currentCoord = {lat, lng};
                let destinationCoord = {lat: parseFloat(place.y), lng: parseFloat(place.x)};
                // 기존 경로 선 제거
                polyline?.setMap(null);

                // Tmap 도보 경로 API 호출
                const xhrRoute = new XMLHttpRequest();
                xhrRoute.onreadystatechange = () => {
                    if (xhrRoute.readyState !== XMLHttpRequest.DONE) return;
                    if (xhrRoute.status < 200 || xhrRoute.status >= 400) {
                        alert('길찾기 실패');
                        return;
                    }

                    const response = JSON.parse(xhrRoute.responseText);
                    const features = response.features;
                    // console.log(features);
                    const linePath = [];

                    for (let i = 0; i < features.length; i++) {
                        const geometry = features[i].geometry;
                        if (geometry.type === "LineString") {
                            for (let j = 0; j < geometry.coordinates.length; j++) {
                                const [lng, lat] = geometry.coordinates[j];
                                linePath.push(new kakao.maps.LatLng(lat, lng));
                            }
                        }
                    }
                    polyline = new kakao.maps.Polyline({
                        path: linePath,
                        strokeWeight: 5,
                        strokeColor: '#FF0000',
                        strokeOpacity: 0.9,
                        strokeStyle: 'solid'
                    });
                    polyline.setMap(mapInstance);

                    // 거리 및 시간 정보 표시
                    const info = features.find(f => f.properties && f.properties.totalDistance);
                    if (info) {
                        const distance = info.properties.totalDistance;
                        const time = info.properties.totalTime;
                        libDetail.innerHTML += `
                        <div class="route-info">
                            <span>예상 거리: ${(distance / 1000).toFixed(2)} km</span>
                            <span>예상 시간: ${(time / 60).toFixed(0)} 분</span>
                        </div>
                            `;
                    }
                    pedestrianNavi.querySelectorAll('.description').forEach(item => item.remove());
                    for (let i = 0; i < features.length; i++) {
                        const detailInfo = features[i]
                        if (detailInfo.geometry.type === 'Point') {
                            const detail = detailInfo.properties.description;
                            pedestrianNavi.querySelector(':scope>.info').innerHTML += `
                                <li class="description">
                                ${detail}
                                </li>`
                        }
                    }
                };
                const payload = {
                    startX: currentCoord.lng.toString(),
                    startY: currentCoord.lat.toString(),
                    endX: destinationCoord.lng.toString(),
                    endY: destinationCoord.lat.toString(),
                    reqCoordType: 'WGS84GEO',
                    resCoordType: 'WGS84GEO',
                    startName: '출발지',
                    endName: '도착지'
                };

                xhrRoute.open('POST', tmapUrl);
                xhrRoute.setRequestHeader('Content-Type', 'application/json');
                xhrRoute.setRequestHeader('appKey', tMapAppKey);
                xhrRoute.send(JSON.stringify(payload));
                pedestrianNavi.classList.add('visible');
                // 기존 라이브러리 상세 정보 (닫기 버튼 포함)
                libDetail.classList.add('visible');
                libDetail.innerHTML = `
                    <span class="content">
                    <h3>${place.place_name}</h3>
                    <span>주소: ${place.road_address_name}</span>
                    <span>전화번호: ${place.phone}</span>
                    <a href="${place.place_url}">${place.place_url}</a>
                    <button class="close">닫기</button>
                    </span>
                `;

                const cloButton = libDetail.querySelector('.close');
                cloButton.addEventListener('click', () => {
                    libDetail.classList.remove('visible');
                    polyline?.setMap(null); // 경로 선 제거
                });

            });


        }
        mapInstance.setBounds(bounds);
        mapInput.value = '';
    }
    const url = new URL('https://dapi.kakao.com/v2/local/search/keyword.json'); // .json 누락 주의!
    url.searchParams.set('query', `${destination}`);
    url.searchParams.set('radius', '10000');
    showLoading();
    xhr.open('GET', url.toString());
    xhr.setRequestHeader('Authorization', `KakaoAK ${restApiKey}`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send();
}



