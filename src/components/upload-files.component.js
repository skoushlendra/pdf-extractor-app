import React, { Component } from "react";
import UploadService from "../services/upload-files.service";

export default class UploadFiles extends Component {
  constructor(props) {
    super(props);
    this.selectFiles = this.selectFiles.bind(this);
    this.upload = this.upload.bind(this);
    this.uploadFiles = this.uploadFiles.bind(this);

    this.state = {
      selectedFiles: undefined,
      progressInfos: [],
      message: null,

      fileInfos: [],
    };
  }

  componentDidMount() {
    UploadService.getFiles().then((response) => {
      this.setState({
        fileInfos: response.data,
      });
    });
  }

  selectFiles(event) {
    this.setState({
      progressInfos: [],
      selectedFiles: event.target.files,
    });
  }

  upload(idx, file) {
    let _progressInfos = [...this.state.progressInfos];

    UploadService.upload(file, (event) => {
      _progressInfos[idx].percentage = Math.round((100 * event.loaded) / event.total);
      this.setState({
        _progressInfos,
      });
    })
      .then((response) => {
        this.setState((prev) => {
          let prevMessage = prev.message ? prev.message + ", " : "";
          return {
            message: prevMessage + response.data.orderIds,
          };
        });

        return UploadService.getFiles();
      })
      .then((files) => {
        this.setState({
          fileInfos: files.data,
        });
      })
      .catch(() => {
        _progressInfos[idx].percentage = 0;
        this.setState({
          progressInfos: _progressInfos,
          message: "Could not upload the file!",
        });
      });
  }

  uploadFiles() {
    const selectedFiles = this.state.selectedFiles;

    let _progressInfos = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      _progressInfos.push({ percentage: 0, fileName: selectedFiles[i].name });
    }

    this.setState(
      {
        progressInfos: _progressInfos,
        message: null,
      },
      () => {
        for (let i = 0; i < selectedFiles.length; i++) {
          this.upload(i, selectedFiles[i]);
        }
      }
    );
  }

  render() {
    const { selectedFiles, progressInfos, message, fileInfos } = this.state;

    return (
      <div>
        {progressInfos &&
          progressInfos.map((progressInfo, index) => (
            <div className="mb-2">
              <span>{progressInfo.fileName}</span>
              <div className="progress">
                <div
                  className="progress-bar progress-bar-info"
                  role="progressbar"
                  aria-valuenow={progressInfo.percentage}
                  aria-valuemin="0"
                  aria-valuemax="100"
                  style={{ width: progressInfo.percentage + "%" }}
                >
                  {progressInfo.percentage}%
                </div>
              </div>
            </div>
          ))}

        <label className="btn btn-default">
          <input type="file" multiple onChange={this.selectFiles} />
        </label>

        <button
          className="btn btn-success"
          disabled={!selectedFiles}
          onClick={this.uploadFiles}
        >
          Upload
        </button>

        {message && (
          <div class="container py-5">
              <div class="row">
                  <div class="col-lg-7 mx-auto">
                      <div class="card rounded-0 border-0 shadow">
                          <div class="card-body p-5">
                              <div class="table-responsive">
                                  <table class="table" id="data-table">
                                      <thead>
                                          <tr>
                                              <th scope="col">#</th>
                                              <th scope="col">ID</th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                        {message.split(",").map((item, index) => (
                                            <tr key={index}>
                                              <th scope="row">{(index+1)}</th>
                                              <td>{item}</td>
                                            </tr>
                                          ))}
                                      </tbody>
                                  </table>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
        )}

        <div className="card" class="hide">
          <div className="card-header">List of Files</div>
          <ul className="list-group list-group-flush">
            {fileInfos &&
              fileInfos.map((file, index) => (
                <li className="list-group-item" key={index}>
                  <a href={file.url}>{file.name}</a>
                </li>
              ))}
          </ul>
        </div>
      </div>
    );
  }
}
