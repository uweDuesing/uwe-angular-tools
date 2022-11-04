import {AfterViewInit, Component, OnInit} from '@angular/core';
import Map from 'ol/Map'
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import {fromLonLat} from "ol/proj";
@Component({
  selector: 'lib-map',
  templateUrl: 'map.component.html',
  styleUrls: ['map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit {

  constructor() {
  }

  ngOnInit(): void {

  }
  ngAfterViewInit() {
    this.createMap();
  }


  public createMap = () => {
    const map = new Map({
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      target: 'map',
      view: new View({
        center: fromLonLat([175, -37]),
        zoom: 7,
      }),
    });
  }
}
