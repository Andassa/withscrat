import React, { useRef, useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, FeatureGroup, useMap, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { EditControl } from 'react-leaflet-draw';
import L from "leaflet";

//l'icon du marqueur
const icon = L.icon({
    iconUrl: "./location.png",
    iconSize: [50, 50]
});

//la fonction qui zoom sur le permis
function ResetCenterView(props) {
    const { selectPosition } = props;
    const map = useMap();
    const currentZoom = map.getZoom();
    const newZoom = currentZoom - 1;

    useEffect(() => {
        if (selectPosition) {
            const bounds = L.latLngBounds(selectPosition);
            map.fitBounds(bounds, {
                animate: true
            });

        }
    }, [selectPosition]);

    return null;
}
const position = [-18.822733, 47.171147];

//le component principal
const DrawMap = (props) => {
    //les props ont normalement  besoin d'être vérifier par type
    const { setCoordonnees } = props;
    const { selectPosition } = props;
    const { carreSelect } = props;
    const locationSelection = [selectPosition?.lat, selectPosition?.lon];
    const [drawingEnabled, setDrawingEnabled] = useState(true);
    const [editableLayers, setEditableLayers] = useState(null);
    const [editingEnabled, setEditingEnabled] = useState(false);
    const { decoupeAffiche } = props;
    const { listeCarre } = props;
    const [dessinCarre, setDessinCarre] = useState([]);
    const [dessinCarreSelect, setDessinCarreSelect] = useState([]);

    const [coordPolygone, setCoordPolygone] = useState(null);
    // Le style du polygone
    // const polygonOptions = {
    //     color: 'purple', // Couleur du polygone
    //     fillColor: 'blue', // Couleur de remplissage
    //     fillOpacity: 0.1, // Opacité de remplissage
    // };
    const dessinCarreOption = {
        color: 'blue',
        fillcolor: 'blue',
        fillOpacity: 0.2,
    }
    const dessinCarreSelectOption = {
        color: 'blue',
        fillOpacity: 0.5
    }
    
    // s'il y a des decoupes à afficher ou s'il y a des changements au niveau de decoupe Affiche 
    // useEffect(() => {
    //     if (decoupeAffiche.length !== 0) {
    //         let coords = [];
    //         decoupeAffiche.forEach(element => {
    //             coords.push(element['st_asgeojson']['coordinates']);
    //         });
    //         setCoordPolygone(coords);
    //     }
    //     else {
    //         setCoordPolygone(null);
    //         setDessinCarre([]);
    //     }
    // }, [decoupeAffiche]);
    // après l'import de liste de centre, il se transforment en carrées qui s'affiche ici 
    useEffect(() => {
        if (listeCarre.length > 0) {
            let listIn = [];
            listeCarre.forEach(element => {
                listIn.push(element['coord'][0]);
            });
            setDessinCarre(listIn);
        }
    }, [listeCarre]);
    useEffect(() => {
        if (carreSelect.length != 0) {
            fetch('http://localhost:3000/formeUnCarre', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ centre: carreSelect })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erreur lors de l\'envoi du tableau JSON');
                    }
                    return response.json();
                })
                .then(data => {
                    setDessinCarreSelect(data)
                })
                .catch(error => {
                    console.error('Erreur :', error);
                });
        }
    }, [carreSelect]);
    // useEffect(()=>{
    //     console.log(dessinCarreSelect)
    // },[dessinCarreSelect])
    const featureGroupRef = useRef();

    const onCreated = (e) => {
        const type = e.layerType;
        const layer = e.layer;

        if (type === 'polygon') {
            const coordinates = layer.getLatLngs()[0].map((latLng) => [latLng.lat, latLng.lng]);
            setCoordonnees(coordinates);
        }

        featureGroupRef.current.addLayer(layer);
        setDrawingEnabled(false);
        setEditableLayers(e.layer);
        setEditingEnabled(true);

    };
    const handleOnEdited = (e) => {
        // Obtenez les nouvelles coordonnées après l'édition
        const newCoordinates = e.layers.getLayers()[0].getLatLngs()[0].map((latLng) => [latLng.lat, latLng.lng]);
        setCoordonnees(newCoordinates);
    };
    const handleDelete = (e) => {
        setDrawingEnabled(true);
        setCoordonnees([]);
    }

    return (
        <MapContainer center={position} zoom={6.4} style={{ width: "100%", height: "100%", boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.2)' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://api.maptiler.com/maps/topo-v2/256/{z}/{x}/{y}.png?key=vbdUPhtNPokkRlCqiG7n"
            />
            {/* {coordPolygone != null && (<Polygon positions={coordPolygone} pathOptions={polygonOptions} />)} */}
            {dessinCarre != null && (<Polygon positions={dessinCarre} pathOptions={dessinCarreOption} />)}
            {dessinCarreSelect != null && (<Polygon positions={dessinCarreSelect} pathOptions={dessinCarreSelectOption} />)}
            
            <FeatureGroup ref={featureGroupRef}>
                <EditControl
                    position="topright"
                    draw={{
                        rectangle: false,
                        polyline: false,
                        circle: false,
                        marker: false,
                        circlemarker: false,
                        polygon: drawingEnabled ? {
                            allowIntersection: false,
                            drawError: {
                                color: '#e1e100',
                                timeout: 1000,
                            },
                            shapeOptions: {
                                color: '#97009c',
                            },
                        } : false,
                    }}
                    edit={{
                        featureGroup: featureGroupRef.current,
                        // featureGroup: editableLayers,
                        edit: editingEnabled,

                    }}
                    onCreated={onCreated}
                    onEdited={handleOnEdited}
                    onDeleted={handleDelete}
                />
            </FeatureGroup>

            {selectPosition && (
                <Marker position={locationSelection} icon={icon}>
                    <Popup>
                        A pretty CSS3 popup. <br /> Easily customizable.
                    </Popup>
                </Marker>
            )}
            {dessinCarre.length>0 && (<ResetCenterView selectPosition={dessinCarre} />)}



        </MapContainer>
    );
};

export default DrawMap;