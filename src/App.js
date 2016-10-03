import React, { Component } from 'react';
import './App.css';
import $ from 'jquery';
import Dropzone from 'react-dropzone';

class App extends Component {
  constructor (props) {
    super(props);

    this.state = {
      files: [],
      error: null
    };

    this.onDrop = this.onDrop.bind(this);
    this.upload = this.upload.bind(this);
  }

  upload () {
    const url = 'https://traphouse-la.herokuapp.com/attendees';

    this.state.files.forEach((f) => {
      const r = new FileReader();
      r.onload = (e) => {
        const csv = this.csvJSON(e.target.result);
        csv.forEach((c) => {
          if (c.number) {
            $.ajax({
              url: url,
              dataType: 'json',
              type: 'POST',
              data: c,
              success: function(data) {
                this.setState({data: data});
              }.bind(this),
              error: function(xhr, status, err) {
                console.error(url, status, err.toString());
              }
            });
          }
        });
      };
      r.readAsText(f);
    });
  }

  csvJSON (csv) {
    const lines = csv.split("\n");
    const result = [];
    const headers=lines[0].split(",");

    for (let i = 1; i < lines.length; i++) {
      let obj = {};
      let currentline = lines[i].split(",");
      for (let j=0; j<headers.length; j++){
        obj[headers[j]] = currentline[j];
      }
      result.push(obj);
    }
  return result; 
}

  onDrop (files) {
    files.forEach((f) => {
      if (f.type === 'text/csv' || f.name.substring(f.name.length - 3, f.name.length) === 'csv') {
        const newFiles = this.state.files;
        newFiles.push(f);
        this.setState({
          files: newFiles,
          error: null
        });
      } else {
        this.setState({
          error: 'Please make sure your file ends in .csv'
        });
      }
    });
  }

  render() {
    const {
      error,
      files
    } = this.state;

    const filePreviews = files.map((f, i) => {
      return (
        <div key={i}>{f.name}</div>
      );
    })

    return (
      <div className="App">
        <div className="App-header">
          <h2>Traphouse Import Peoples</h2>
        </div>
        <p className="App-intro">
          format: name,number,apptTime,image
          image has to be a url to a jpg, png, gif. Can be blank
        </p>
        <p className="error">
          {error}
        </p>
        <Dropzone onDrop={this.onDrop} className="dropzone">
          <span>Drop files to attach, or click to browse</span>
          {filePreviews}
        </Dropzone>
        <button disabled={error || files.length < 1} onClick={this.upload}>Upload</button>
      </div>
    );
  }
}

export default App;
