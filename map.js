'use strict';

let map
let mapEvent
let workout
const workouts = []
let theMarker

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


function setWorkout(workout) {
    const referance = ref(db, 'workouts/' + workout.id)
    set(referance, workout)

}

function addRunningPopup(workout) {
    L.marker(workout.coords).addTo(map)
        .bindPopup(L.popup({
            autoClose: false,
            closeOnClick: false,
            maxWidth: 200,
            className: 'running-popup',

        })).setPopupContent(`🏃‍♂️ Running on ${workout.date.slice(4, 10)}`)
        .openPopup();
}

function addCyclingPopup(workout) {
    L.marker([workout.coords[0], workout.coords[1]]).addTo(map)
        .bindPopup(L.popup({
            autoClose: false,
            closeOnClick: false,
            maxWidth: 200,
            className: 'cycling-popup',

        })).setPopupContent(` 🚴‍♀️ Cycling on ${workout.date.slice(4, 10)}`)
        .openPopup();
}


function updateCycling(workout) {

    const html = ` <li class="workout workout--cycling" data-id=${workout.id}>
    <h2 class="workout__title">Cycling on ${workout.date.slice(4, 10)}</h2>
   
    <div class="workout__details">
   
      <span class="workout__icon">🚴‍♀️</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.elevGain}</span>
      <span class="workout__unit">km/h</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⛰</span>
      <span class="workout__value">${workout.speed}</span>
      <span class="workout__unit">m</span>
    </div>
   <button class = 'workout__delete' >Delete</button>
  </li> `

    containerWorkouts.insertAdjacentHTML('beforeend', html)
    form.classList.add('hidden')
    document.querySelectorAll('.workout__delete').forEach(el => el.addEventListener('click', deleteFunc))
}

function updateRunning(workout) {
    const html = `<li class="workout workout--running" data-id=${workout.id}>
    <h2 class="workout__title">Running on ${workout.date.slice(4, 10)}</h2>
    <div class="workout__details">
      <span class="workout__icon">🏃‍♂️</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.cadence}</span>
      <span class="workout__unit">min/km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${workout.pace}</span>
      <span class="workout__unit">spm</span>
    </div>
    <button class = 'workout__delete' >Delete</button>
    </li>`

    containerWorkouts.insertAdjacentHTML('beforeend', html)
    form.classList.add('hidden')
    document.querySelectorAll('.workout__delete').forEach(el => el.addEventListener('click', deleteFunc))
}




import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyD0rGm5DYkuqEfR0gf0sjfbs3Gnm4KrJ08",
    authDomain: "mapty-1219f.firebaseapp.com",
    databaseURL: "https://mapty-1219f-default-rtdb.firebaseio.com",
    projectId: "mapty-1219f",
    storageBucket: "mapty-1219f.appspot.com",
    messagingSenderId: "261209972363",
    appId: "1:261209972363:web:00f5ea69228643249c7e8e",
    measurementId: "G-FQV99NZJNZ"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-database.js"

const db = getDatabase()



function deleteFunc(e) {
    const id = e.target.closest('.workout').dataset.id
    const referance = ref(db, 'workouts/' + id)
    let latlng

    workouts.forEach(el => {
        if (el.id === +id) {
            latlng = el.coords

        } else { latlng = 'error' }
    })

    set(referance, null)
    document.querySelectorAll('.workout').forEach(el => {
        if (el.dataset.id === id) {
            el.remove()
            window.location.reload()
        }
    })
}

function getValues() {

    const referance = ref(db, 'workouts/')
    onValue(referance, (snapshot) => {
        snapshot.forEach(child => {
            const workout = child.val()
            if (workout.type === 'running') {
                updateRunning(workout)
                addRunningPopup(workout)
                workouts.push(workout)
                document.querySelectorAll('.workout__delete').forEach(el => el.addEventListener('click', deleteFunc))


            }

            if (workout.type === 'cycling') {
                updateCycling(workout)
                addCyclingPopup(workout)
                workouts.push(workout)
                document.querySelectorAll('.workout__delete').forEach(el => el.addEventListener('click', deleteFunc))

            }
        })
    }, {
        onlyOnce: true
    })

}

getValues()

class Workout {
    date = new Date() + ''
    id = Date.now()

    constructor(distance, coords, duration) {
        this.distance = distance
        this.coords = coords
        this.duration = duration

    }
}

class Running extends Workout {
    constructor(distance, coords, duration, cadence) {
        super(distance, coords, duration)
        this.cadence = cadence
        this.calculatePace()
        this.type = 'running'
    }
    calculatePace() {
        this.pace = +this.duration / +this.distance
        return this.pace
    }
}

class Cycling extends Workout {
    constructor(distance, coords, duration, elevGain) {
        super(distance, coords, duration)
        this.elevGain = elevGain
        this.calculateSpeed()
        this.type = 'cycling'
    }
    calculateSpeed() {
        this.speed = +this.distance / (+this.duration / 60)
        return this.speed
    }
}

navigator.geolocation.getCurrentPosition(function (pos) {
    const latitude = pos.coords.latitude
    const longitute = pos.coords.longitude

    map = L.map('map').setView([latitude, longitute], 13);


    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    L.marker([latitude, longitute]).addTo(map)
        .bindPopup('My current position')
        .openPopup()
    map.on('click', function (event) {
        mapEvent = event
        form.classList.remove('hidden')
    }, function () {
        alert('Error')

    })

    form.addEventListener('submit', function (e) {
        e.preventDefault()
        if (inputDistance.value && (inputCadence.value || inputElevation.value) && inputDuration.value) {
            if (inputType.value === 'running') {

                workout = new Running(inputDistance.value, [mapEvent.latlng.lat, mapEvent.latlng.lng], inputDuration.value, inputCadence.value)
                workouts.push(workout)
                setWorkout(workout)
                updateRunning(workout)
                addRunningPopup(workout)
                form.classList.add('hidden')
            }

            if (inputType.value === 'cycling') {

                workout = new Cycling(+inputDistance.value, [mapEvent.latlng.lat, mapEvent.latlng.lng], +inputDuration.value, +inputElevation.value)
                workouts.push(workout)
                setWorkout(workout)
                updateCycling(workout)
                addCyclingPopup(workout)
                form.classList.add('hidden')
            }
            inputCadence.value = ''
            inputDistance.value = ''
            inputDuration.value = ''
            inputElevation.value = ''

        } else { alert('All inputs must be filled') }
    })

})

inputType.addEventListener('change', function () {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
})

containerWorkouts.addEventListener('click', function (e) {

    const workoutElement = e.target.closest('.workout')
    if (!workoutElement) return
    const workout = workouts.find(el => el.id == workoutElement.dataset.id)
    map.setView(workout.coords, 13)

})

