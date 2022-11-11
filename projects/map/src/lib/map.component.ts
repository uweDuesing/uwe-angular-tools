import {AfterViewInit, Component, OnInit, ViewEncapsulation} from '@angular/core';
import Map from 'ol/Map'
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import {fromLonLat} from "ol/proj";
import XYZ from 'ol/source/XYZ';
import {ReplaySubject, Subject} from "rxjs";
import {Observable} from "ol";
import {tile} from "ol/loadingstrategy";
@Component({
  selector: 'lib-map',
  templateUrl: 'map.component.html',
  styleUrls: ['map.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MapComponent implements OnInit, AfterViewInit {

  private OSMSource: any;
  private olSource: any;
  private map: any;
  private currentZoom: number = 5;

  private onlineLayer: any;
  private offlineLayer: any;
  constructor() {

  }

  ngOnInit(): void {
    this.OSMSource = new OSM();


    window.addEventListener('offline', (e)=> {
      if (this.map.getView().getZoom() > 10) {

        this.map.removeLayer(this.onlineLayer);
        this.addOfflineLayer();
      } else {
        this.removeOfflineLayer();
      }

    });
    window.addEventListener('online', (e)=> {
      this.map.addLayer(this.onlineLayer);

    });




  }

  ngAfterViewInit() {
    this.map = this.createMap();

    this.map.on('moveend', () => {
      this.currentZoom =Math.round(this.map.getView().getZoom());

    })

  }
  private buildLayers = (): any[] => {

    this.onlineLayer =  new TileLayer({
      source: this.OSMSource,
    });
    return [this.onlineLayer];
 }


  public createMap = (): Map => {

    return new Map({
      layers: this.buildLayers(),
      target: 'map',
      view: new View({
        center: fromLonLat([175, -37]),
        zoom: this.currentZoom
      }),
    });
  }


  public cacheTiles = () => {

    const osmExtent = this.map.getView().calculateExtent();
    const currentZoom = Math.round(this.map.getView().getZoom());
    this.OSMSource.getTileGrid().forEachTileCoord(osmExtent, currentZoom, (tileCoord: number[]) => {
      const image = document.createElement('img');
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = this.OSMSource.getTileGrid().getTileSize(currentZoom)
        canvas.height = this.OSMSource.getTileGrid().getTileSize(currentZoom);
        const ctx = canvas.getContext('2d');
        // @ts-ignore
        // @ts-ignore
        ctx.drawImage(image, 0, 0);
        localStorage.setItem('OSM_' + tileCoord[0] + '_' + tileCoord[1] + '_' + (-tileCoord[2] - 1), canvas.toDataURL());
        image.remove();
        canvas.remove();

        // @ts-ignore

      }
      image.crossOrigin = 'Anonymous';
      image.src = this.OSMSource.getTileUrlFunction()(tileCoord);
    })
  }


  addOfflineLayer = () => {
    this.offlineLayer = new TileLayer({
      source: new XYZ({
        maxZoom: this.currentZoom,
        minZoom: this.currentZoom,
        // @ts-ignore
        tileUrlFunction: function (tileCoord) {

          const tile = localStorage.getItem('OSM_' + tileCoord[0] + '_' + tileCoord[1] + '_' + (-tileCoord[2] - 1));
          return tile;
        }
      })
    });
    this.map.addLayer(this.offlineLayer);
  }
  removeOfflineLayer = () => {
    this.map.removeLayer(this.offlineLayer);
  }
  removeOnlineLayer = () => {
    this.map.removeLayer(this.offlineLayer);
  }
}
