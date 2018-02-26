import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import './Tooltip.css';

const TooltipOverlay = ({ children, text, placement }) => {
  const tooltip = (
    <Tooltip id="tooltip">
      <strong>{text}</strong>
    </Tooltip>
  );
  
  return (
    <OverlayTrigger placement={placement} overlay={tooltip}>
      <div className="tooltip_overlay">{children}</div>
    </OverlayTrigger>
  );
}

TooltipOverlay.propTypes = {
  text: PropTypes.string.isRequired,
  placement: PropTypes.string.isRequired,
}

export default TooltipOverlay;