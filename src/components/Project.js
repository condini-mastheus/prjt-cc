import React, { Component } from 'react';
import Fade from 'react-reveal/Fade';
import jsonp from 'jsonp';
import Spinner from './Spinner';

const API_KEY = 'x8fCQnDWe9hC20uZ7vgnmvWXuf9pplBb';
const URL = `https://api.behance.net/v2/projects`;
const USERNAME = 'carolcarretto';

const imagesLoaded = parentElement => {
  const imgs = parentElement.querySelectorAll('img');
  [...imgs].map(img => {
    if (!img.complete) {
      return false;
    }
  });
  return true;
};

class Project extends Component {
  state = {
    project: [],
    loading: true
  };

  fetchData = async id => {
    // Search sessionStorage for projects array. If present, set state to it. If not, proceed to the API call.
    const cachedProject = sessionStorage.getItem(id);
    if (cachedProject) {
      this.setState({ project: JSON.parse(cachedProject) });
      return;
    }

    // If no data is found in sessionStorage, make an API call, then save result to sessionStorage.
    const response = await jsonp(
      `${URL}/${id}?client_id=${API_KEY}`,
      null,
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          const { project } = data;
          // If an user tries to load a project from another author, redirect to home.
          if (project.owners[0].username !== USERNAME) {
            this.props.history.push('/');
          }
          this.onFetchResult(project, project.id);
        }
      }
    );
    return response;
  };

  onFetchResult(data, key) {
    // Save API call result to sessionStorage, then set state to it.
    sessionStorage.setItem(key, JSON.stringify(data));
    this.setState({ project: data });
  }

  async componentDidMount() {
    const { id } = this.props.match.params;
    this.fetchData(id);
  }

  handleImageLoad = () => {
    this.setState({ loaded: !imagesLoaded(this.container) });
  };

  renderSpinner() {
    if (!this.state.loading) {
      return null;
    }
    return <Spinner />;
  }

  renderModules() {
    if (this.state.project.modules !== undefined) {
      return this.state.project.modules.map(module => {
        switch (module.type) {
          case 'text':
            const doc = new DOMParser().parseFromString(
              module.text,
              'text/html'
            );
            return (
              <Fade>
                <div
                  key={module.id}
                  className='content__paragraph'
                  dangerouslySetInnerHTML={{ __html: doc.body.innerHTML }}
                />
              </Fade>
            );
          case 'image':
            return (
              <Fade>
                <img
                  alt={module.caption}
                  src={module.src}
                  key={module.id}
                  onLoad={this.handleImageLoad}
                  onError={this.handleImageLoad}
                />
              </Fade>
            );
          case 'media_collection':
            return module.components.map(component => {
              return (
                <Fade>
                  <img
                    alt={component.caption}
                    src={component.src}
                    key={component.id}
                    onLoad={this.handleImageLoad}
                    onError={this.handleImageLoad}
                  />
                </Fade>
              );
            });
          default:
            return null;
        }
      });
    }
  }

  render() {
    if (!this.state.project) {
      return <div>Loading...</div>;
    }
    return (
      <div className='content'>
        <div className='row'>
          <Fade>
            {this.renderSpinner()}
            <div
              className='content__description'
              ref={el => {
                this.container = el;
              }}
            >
              <h1 className='content__title'>{this.state.project.name}</h1>
              {this.renderModules()}
            </div>
          </Fade>
        </div>
      </div>
    );
  }
}

export default Project;
