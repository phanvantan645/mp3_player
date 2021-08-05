const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_CONFIG_KEY = 'mp3_player_config';
const APP_URL =
    'https://api.apify.com/v2/key-value-stores/EJ3Ppyr2t73Ifit64/records/LATEST?fbclid=IwAR3u9bOkU6Gd6IjN_jLgAbf5oFI3g0d3ChJk81lzucP0LoFfp1w5Qm7TyRM';

const player = $('.player');
const heading = $('.header-song-title');
const cd = $('.cd');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const btnPlays = $$('.btn-play');
const progress = $('#progress');
const btnNext = $('.btn-next');
const btnPrev = $('.btn-prev');
const btnRandom = $('.btn-random');
const btnRepeat = $('.btn-repeat');
const listSong = $$('.song:not(.active)');
const playList = $('.playlist');
const optionControl = $('.option-control');
const btnOptions = $('.btn-option .bx-dots-horizontal-rounded');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_CONFIG_KEY)) || {},
    setConfig(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_CONFIG_KEY, JSON.stringify(this.config));
    },
    songs: [
        {
            name: 'Thê lương',
            singer: 'Phúc Chinh',
            path: './assets/music/the-luong.mp3',
            image: './assets/img/the-luong.jpg',
        },
        {
            name: 'Anh đâu phải anh ấy',
            singer: 'Vương Anh Tú',
            path: './assets/music/anh-dau-phai-anh-ay.mp3',
            image: './assets/img/anh-dau-phai-anh-ay.jpg',
        },
        {
            name: 'Anh là người xấu',
            singer: 'Thái Vũ (Blackbi)',
            path: './assets/music/anh-la-nguoi-xau.mp3',
            image: './assets/img/anh-la-nguoi-xau.jpg',
        },
        {
            name: 'Già cùng nhau là được',
            singer: 'TeA ft. PC',
            path: './assets/music/gia-cung-nhau-la-duoc.mp3',
            image: './assets/img/gia-cung-nhau-la-duoc.jpg',
        },
        {
            name: 'Hẹn yêu',
            singer: 'Minh Vương M4U, Thương Võ',
            path: './assets/music/hen-yeu.mp3',
            image: './assets/img/hen-yeu.jpg',
        },
        {
            name: 'Khóc cùng em',
            singer: 'Mr.Siro, Wind, Gray',
            path: './assets/music/khoc-cung-em.mp3',
            image: './assets/img/khoc-cung-em.jpg',
        },
        {
            name: 'Rồi tới luôn',
            singer: 'Nal',
            path: './assets/music/Roi-Toi-Luon-Nal.mp3',
            image: './assets/img/Roi-Toi-Luon-Nal.jpg',
        },
        {
            name: 'Sai cách yêu',
            singer: 'Lê Bảo Bình',
            path: './assets/music/sai-cach-yeu.mp3',
            image: './assets/img/sai-cach-yeu.jpg',
        },
    ],
    render() {
        const htmls = this.songs.map((song, index) => {
            return `
            <div data-index=${index} class="song ${
                index === this.currentIndex ? 'active' : ''
            }">
                <div class="song-img">
                    <div
                    class="song-thumb"
                    style="
                        background-image: url('${song.image}');
                    "
                ></div>
                </div>
                <div class="song-info">
                    <h2 class="song-title">${song.name}</h2>
                    <p class="song-singer">${song.singer}</p>
                </div>
                <div class="btn btn-option song-control">
                    <i class="bx bx-dots-horizontal-rounded"></i>
                    <div class="option-control">
                        <ul class="options">
                            <li class="option-item">
                                <i class='bx bx-star'></i>
                                <span>Thêm vào danh sách yêu thích</span>
                            </li>
                            <li class="option-item">
                                <i class='bx bxs-trash'></i>
                                <span>Xóa khỏi danh sách</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            `;
        });
        playList.innerHTML = htmls.join(' ');
    },
    defineProperties() {
        Object.defineProperty(this, 'currentSong', {
            get() {
                return this.songs[this.currentIndex];
            },
        });
    },
    handleEvents() {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // Xu ly cd quay
        const cdAnimation = cdThumb.animate(
            [
                {
                    transform: 'rotate(360deg)',
                },
            ],
            {
                duration: 10000,
                iterations: Infinity,
            }
        );
        cdAnimation.pause();
        window.onbeforeunload = function () {
            window.scrollTo(0, 0);
        };

        // Xu ly scroll
        document.onscroll = function () {
            const scrollTop =
                window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        };

        // Xu ly play
        btnPlays.forEach((btnPlay) => {
            btnPlay.onclick = function () {
                if (_this.isPlaying) {
                    audio.pause();
                } else {
                    audio.play();
                }
            };
        });

        //Audio lang nghe event
        audio.onplay = function () {
            _this.isPlaying = true;
            cdAnimation.play();
            player.classList.add('playing');
        };
        audio.onpause = function () {
            _this.isPlaying = false;
            cdAnimation.pause();
            player.classList.remove('playing');
        };

        //Khi tien do bai hat thay doi
        audio.ontimeupdate = function () {
            let currentTime = audio.currentTime;
            const duration = audio.duration;
            if (currentTime) {
                const progressPercent = Math.floor(
                    (currentTime / duration) * 100
                );
                progress.value = progressPercent;
            }
        };
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play();
            } else {
                btnNext.click();
            }
        };

        // Xu ly tua audio
        progress.onchange = function (e) {
            audio.currentTime = (e.target.value / 100) * audio.duration;
        };

        //Next song
        btnNext.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            _this.startAudio();
        };
        // Prev song
        btnPrev.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            _this.startAudio();
        };
        // Random song
        btnRandom.onclick = function () {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            this.classList.toggle('active', _this.isRandom);
        };
        // Repeat song
        btnRepeat.onclick = function () {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            this.classList.toggle('active', _this.isRepeat);
        };

        // Lang nghe hanh vi click playlist
        playList.onclick = function (e) {
            const notActiveSong = e.target.closest('.song:not(.active)');
            const btnOption = e.target.closest('.btn-option');
            // Click play this song
            if (notActiveSong || btnOption) {
                // Xu ly khi click vao bai hat
                if (notActiveSong && !btnOption) {
                    _this.currentIndex = Number(notActiveSong.dataset.index);
                    _this.loadCurrentSong();
                    _this.startAudio();
                }
                // Xu ly khi click vao option cua bai hat
                if (btnOption) {
                    console.log([
                        (_this.currentIndex = Number(
                            notActiveSong.dataset.index
                        )),
                    ]);
                }
            }
        };
    },
    loadConfig() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
        btnRandom.classList.toggle('active', this.isRandom);
        btnRepeat.classList.toggle('active', this.isRepeat);
    },
    loadCurrentSong() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    nextSong() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong() {
        this.currentIndex--;
        if (this.currentIndex <= 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    playRandomSong() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
            console.log(newIndex);
        } while (newIndex === this.currentIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    startAudio() {
        progress.value = 0;
        audio.currentTime = 0;
        audio.play();
        this.render();
        this.scrollToActiveSong();
    },
    scrollToActiveSong() {
        const activeSong = $('.song.active');
        setTimeout(() => {
            activeSong.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }, 500);
    },
    async getMusic() {
        const { songs } = await fetch(APP_URL, {
            mode: 'cors',
        }).then((res) => res.json().then((res) => res));
        const playlistVN = songs.top100_VN[0].songs;
        const newSongs = playlistVN.map((song) => {
            return {
                name: song.title,
                singer: song.creator,
                path: song.music,
                image: song.bgImage || './assets/img/thumb.jpg',
            };
        });
        newSongs.forEach((song) => {
            this.songs.push(song);
        });
    },
    loadSuspense() {
        const suspense = $('.lds-ripple');
        player.style.display = 'none';

        suspense.style.display = 'block';
        setTimeout(() => {
            suspense.style.display = 'none';
            player.style.display = 'block';
        }, 4000);
    },
    start() {
        // Get music
        this.getMusic();
        // Loading
        this.loadSuspense();
        //Load config
        this.loadConfig();
        setTimeout(() => {
            // Dinh nghia cac thuoc tinh cho object
            this.defineProperties();

            // Lang nghe su kien DOM
            this.handleEvents();

            // Tai bai hat dau tien vao UI
            this.loadCurrentSong();

            // Render playlist
            this.render();
        }, 4000);
    },
};

app.start();
