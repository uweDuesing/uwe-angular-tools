import {AfterViewInit, Component, OnInit} from '@angular/core';
import Map from 'ol/Map'
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import {fromLonLat} from "ol/proj";
import Extent from 'ol/interaction/Extent';

@Component({
  selector: 'lib-map',
  templateUrl: 'map.component.html',
  styleUrls: ['map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit {

  private OSMSource: any;
  private map: any;
  private currentZoom: number = 5;

  constructor() {
  }

  ngOnInit(): void {
    this.OSMSource = new OSM();
    console.log('start')
  }

  ngAfterViewInit() {
    this.map = this.createMap();
    this.map.on('moveend', () => {
      this.currentZoom = this.map.getView().getZoom();
      console.log('updated zoom to:', this.currentZoom);

    })

  }


  public cacheTiles = () => {
    const osmExtent  = this.map.getView().calculateExtent();
    const currentZoom = this.map.getView().getZoom()
    this.OSMSource.getTileGrid().forEachTileCoord(osmExtent, parseInt(currentZoom), (tileCoord: number[]) => {
      const image = document.createElement('img');
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = this.OSMSource.getTileGrid().getTileSize(currentZoom).width;
        canvas.height = this.OSMSource.getTileGrid().getTileSize(currentZoom).height;
        localStorage.setItem('OSM_' + tileCoord[0] + '_' + tileCoord['1'] + (-tileCoord[2] -1), canvas.toDataURL());
        image.remove();
        canvas.remove();
        const ctx = canvas.getContext('2d');
        // @ts-ignore
        ctx.drawImage(image, 0, 0);
      }
      image.crossOrigin = 'Anonymous';
      image.src = this.OSMSource.getTileUrlFunction()(tileCoord);

    })

  }

  public createMap = (): Map => {
    return new Map({
      layers: [
        new TileLayer({
          source: this.OSMSource,
        }),
      ],
      target: 'map',
      view: new View({
        center: fromLonLat([175, -37]),
        zoom: this.currentZoom,
      }),
    });
  }
}
