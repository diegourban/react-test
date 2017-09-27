import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import PubSub from 'pubsub-js';

class FotoAtualizacoes extends Component {

  constructor(props) {
    super(props);
    this.state = {liked : this.props.foto.likeada};
  }

  like(event) {
      event.preventDefault();

      fetch(`http://localhost:8080/api/fotos/${this.props.foto.id}/like?X-AUTH-TOKEN=${localStorage.getItem('auth-token')}`, {method: 'POST'})
      .then(response => {
        if(response.ok) {
          return response.json();
        } else {
          throw new Error("Não foi possível realizar o like da foto");
        }
      })
      .then(liker => {
        this.setState({liked : !this.state.liked});
        PubSub.publish('atualiza-liker', {fotoId: this.props.foto.id, liker});
      });
  }

  render() {
    return(
      <section className="fotoAtualizacoes">
        <a onClick={this.like.bind(this)} href="#" className={this.state.liked ? 'fotoAtualizacoes-like-ativo' : 'fotoAtualizacoes-like'}>Likar</a>
        <form className="fotoAtualizacoes-form">
          <input type="text" placeholder="Adicione um comentário..." className="fotoAtualizacoes-form-campo"/>
          <input type="submit" value="Comentar!" className="fotoAtualizacoes-form-submit"/>
        </form>

      </section>
    );
  }
}

class FotoInfo extends Component {

  constructor(props) {
    super(props);
    this.state = {likers : this.props.foto.likers};
  }

  componentWillMount() {
    PubSub.subscribe('atualiza-liker', (topico, infoLiker) => {
      if(this.props.foto.id === infoLiker.fotoId) {
          const optionalLiker = this.state.likers.find(liker => liker.login === infoLiker.liker.login);
          if(optionalLiker === undefined) {
            const newLikers = this.state.likers.concat(infoLiker.liker);
            this.setState({likers: newLikers});
          } else {
            const newLikers = this.state.likers.filter(liker => liker.login !== infoLiker.liker.login);
            this.setState({likers: newLikers});
          }
      }
    });
  }

  render() {
    return (
      <div className="foto-in fo">
        <div className="foto-info-likes">
          {
            this.state.likers.map(liker => {
              return (<Link to={`/timeline/${liker.login}`} key={liker.login} href="#">{liker.login},</Link>)
            })
          }
          curtiram
        </div>

        <p className="foto-info-legenda">
          <a className="foto-info-autor">{this.props.foto.loginUsuario} </a>
          {this.props.foto.comentario}
        </p>

        <ul className="foto-info-comentarios">
          {
            this.props.foto.comentarios.map(comentario => {
              return(
                <li className="comentario" key={comentario.id}>
                  <Link to={`/timeline/${comentario.login}`} className="foto-info-autor">{comentario.login} </Link>
                  {comentario.texto}
                </li>
              )
            })
          }
        </ul>
      </div>
    );
  }
}

class FotoHeader extends Component {
  render() {
    return(
      <header className="foto-header">
        <figure className="foto-usuario">
          <img src={this.props.foto.urlPerfil} alt="foto do usuario"/>
          <figcaption className="foto-usuario">
            <Link to={`/timeline?${this.props.foto.loginUsuario}`}>
              {this.props.foto.loginUsuario}
            </Link>
          </figcaption>
        </figure>
        <time className="foto-data">{this.props.foto.horario}</time>
      </header>
    );
  }
}

export default class FotoItem extends Component {
  render() {
    return(
      <div className="foto">
        <FotoHeader foto={this.props.foto}/>
        <img alt="foto" className="foto-src" src={this.props.foto.urlFoto}/>
        <FotoInfo foto={this.props.foto}/>
        <FotoAtualizacoes foto={this.props.foto}/>
      </div>
    );
  }
}
