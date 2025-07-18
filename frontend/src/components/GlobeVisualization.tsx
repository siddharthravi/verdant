import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Major US Cities
const usCities = [
  { name: 'New York', lat: 40.7128, lon: -74.0060 },
  { name: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
  { name: 'Chicago', lat: 41.8781, lon: -87.6298 },
  { name: 'Houston', lat: 29.7604, lon: -95.3698 },
  { name: 'Phoenix', lat: 33.4484, lon: -112.0740 },
  { name: 'Philadelphia', lat: 39.9526, lon: -75.1652 },
  { name: 'San Antonio', lat: 29.4241, lon: -98.4936 },
  { name: 'San Diego', lat: 32.7157, lon: -117.1611 },
  { name: 'Dallas', lat: 32.7767, lon: -96.7970 },
  { name: 'San Jose', lat: 37.3382, lon: -121.8863 }
];

// Converts latitude/longitude to a THREE.Vector3 on a sphere
function latLonToVector3(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// --- REPLACE THIS WITH YOUR WEATHERAPI.COM KEY ---
const WEATHER_API_KEY = '1f6f6f72a7f441c2a5f101757251607';
// -----------------------------------------------

// Height of your blue header bar (adjust this)
const HEADER_HEIGHT = 76; // px

const GlobeVisualization: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [popup, setPopup] = useState<{
    visible: boolean;
    left: number;
    top: number;
    city: string;
    weather?: any;
  }>({
    visible: false,
    left: 0,
    top: 0,
    city: '',
    weather: undefined
  });

  useEffect(() => {
    let renderer: THREE.WebGLRenderer | undefined;
    let camera: THREE.PerspectiveCamera | undefined;
    let controls: OrbitControls | undefined;
    let animationId: number | undefined;
    let scene: THREE.Scene | undefined;
    let markers: THREE.Mesh[] = [];

    function getCanvasSize() {
      const width = window.innerWidth;
      const height = window.innerHeight - HEADER_HEIGHT;
      return { width, height };
    }

    let { width: canvasWidth, height: canvasHeight } = getCanvasSize();

    // Setup scene, camera, renderer
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      75,
      canvasWidth / canvasHeight,
      0.1,
      1000
    );
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor(0x000000, 1);

    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    // Responsive resizing
    function handleResize() {
      const { width, height } = getCanvasSize();
      renderer!.setSize(width, height);
      camera!.aspect = width / height;
      camera!.updateProjectionMatrix();
      canvasWidth = width;
      canvasHeight = height;
    }
    window.addEventListener('resize', handleResize);

    // Earth
    const radius = 2;
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('/earthmap.jpg', (texture) => {
      const geometry = new THREE.SphereGeometry(radius, 64, 64);
      const material = new THREE.MeshPhongMaterial({
        map: texture,
        shininess: 10
      });
      const earth = new THREE.Mesh(geometry, material);
      scene?.add(earth);

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      scene?.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
      directionalLight.position.set(5, 5, 5);
      scene?.add(directionalLight);

      renderer?.render(scene!, camera!);
    });

    // City markers
    const markerGeometry = new THREE.SphereGeometry(0.03, 12, 12);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff5733 });
    markers = [];
    usCities.forEach((city) => {
      const pos = latLonToVector3(city.lat, city.lon, radius + 0.03);
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.copy(pos);
      marker.userData = { city: city.name, lat: city.lat, lon: city.lon };
      scene.add(marker);
      markers.push(marker);
    });

    camera.position.z = 5;

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.minDistance = 2.5;
    controls.maxDistance = 10;
    controls.enablePan = false;

    // Raycaster for city marker clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onClick(event: MouseEvent) {
      if (!mountRef.current) return;
      const rect = renderer!.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera!);
      const intersects = raycaster.intersectObjects(markers);
      if (intersects.length > 0) {
        const { city, lat, lon } = intersects[0].object.userData;

        // Popup position relative to the canvas
        let left = event.clientX - rect.left;
        let top = event.clientY - rect.top;

        // Clamp to canvas bounds
        left = Math.max(20, Math.min(left, canvasWidth - 280));
        top = Math.max(40, Math.min(top, canvasHeight - 200));

        setPopup({
          visible: true,
          left,
          top,
          city,
          weather: undefined
        });

        // Fetch weather data for the city using WeatherAPI.com
        fetch(`https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${lat},${lon}`)
          .then(res => res.json())
          .then(data => {
            setPopup(prev => ({
              ...prev,
              weather: data
            }));
          })
          .catch(err => {
            setPopup(prev => ({
              ...prev,
              weather: { error: "Failed to fetch weather data." }
            }));
          });
      }
    }

    renderer.domElement.addEventListener("click", onClick);

    function animate() {
      animationId = requestAnimationFrame(animate);
      controls?.update();
      renderer?.render(scene!, camera!);
    }
    animate();

    return () => {
      renderer?.domElement.removeEventListener("click", onClick);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer) {
        mountRef.current.removeChild(renderer.domElement);
      }
      if (animationId) cancelAnimationFrame(animationId);
      controls?.dispose();
    };
  }, []);

  return (
    <div
      style={{
        width: '100vw',
        height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        marginTop: `${HEADER_HEIGHT}px`,
        background: "#000",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 1,
        overflow: "hidden"
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100vw",
          height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        }}
      >
        <div
          ref={mountRef}
          style={{
            width: "100vw",
            height: `calc(100vh - ${HEADER_HEIGHT}px)`,
            position: "relative",
          }}
        />
        {popup.visible && (
          <div
            style={{
              position: "absolute",
              left: popup.left,
              top: popup.top,
              background: "#222d3b",
              color: "#fff",
              padding: "12px 16px",
              borderRadius: 10,
              pointerEvents: "auto",
              zIndex: 999,
              fontSize: "0.97rem",
              boxShadow: "0 2px 12px rgba(0,0,0,0.22)",
              minWidth: 180,
              maxWidth: 260,
              maxHeight: 180,
              overflow: "auto",
              border: "1px solid #255"
            }}
          >
            <strong>{popup.city}</strong>
            <br />
            {popup.weather ? (
              popup.weather.error ? (
                <div>{popup.weather.error}</div>
              ) : popup.weather.current ? (
                <div>
                  <div>Temperature: {popup.weather.current.temp_f ?? 'N/A'}°F</div>
                  <div>Condition: {popup.weather.current.condition?.text ?? 'N/A'}</div>
                  <div>Precipitation: {popup.weather.current.precip_in ?? 'N/A'} in</div>
                  <div>Humidity: {popup.weather.current.humidity ?? 'N/A'}%</div>
                  <div>Wind: {popup.weather.current.wind_mph ?? 'N/A'} mph</div>
                </div>
              ) : (
                <div>Error: {popup.weather.error?.message ?? 'Unknown error'}</div>
              )
            ) : (
              <div>Loading...</div>
            )}
            <div style={{ marginTop: 10 }}>
              <button style={{
                background: "#2194ce", color: "#fff", border: "none", borderRadius: 5, padding: "4px 10px", cursor: "pointer"
              }} onClick={() => setPopup({ visible: false, left: 0, top: 0, city: '', weather: undefined })}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobeVisualization;