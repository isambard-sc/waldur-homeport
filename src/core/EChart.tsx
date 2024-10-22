import classNames from 'classnames';
import { Component } from 'react';
import { connect } from 'react-redux';
import ResizeObserver from 'resize-observer-polyfill';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { themeSelector } from '@waldur/navigation/theme/store';
import { RootState } from '@waldur/store/reducers';

interface ChartProps {
  width?: string;
  height?: string;
  theme?: any;
  options: any;
  className?: string;
}

class EChartComponent extends Component<ChartProps> {
  container = undefined;
  chart = undefined;

  state = {
    loading: false,
  };

  static defaultProps = {
    width: '100%',
    height: '100%',
  };

  componentDidMount() {
    this.drawChart();
  }

  componentWillUnmount() {
    if (!this.chart) {
      return;
    }
    this.chart.dispose();
    this.container = null;
  }

  componentDidUpdate(prevProps) {
    const { options, theme } = this.props;
    if (options === prevProps.options && theme === prevProps.theme) {
      return;
    } else if (theme !== prevProps.theme) {
      this.chart.dispose();
      this.drawChart();
      return;
    }
    if (this.chart) {
      this.renderChart();
    } else if (!this.chart && !this.state.loading) {
      this.drawChart();
    }
  }

  drawChart() {
    this.setState({
      loading: true,
    });
    import('@waldur/echarts').then((module) => {
      this.setState({
        loading: false,
      });
      if (!this.container) {
        return;
      }
      const echarts = module.default;
      const chart = echarts.getInstanceByDom(this.container);
      if (!chart) {
        this.chart = echarts.init(
          this.container,
          this.props.theme + '-metronic',
        );
      }
      this.renderChart();
      const resizeObserver = new ResizeObserver((entries) => {
        entries.map(({ target }) => {
          const instance = echarts.getInstanceByDom(target);
          if (instance) {
            instance.resize();
          }
        });
      });
      resizeObserver.observe(this.container);
    });
  }

  renderChart() {
    this.chart.setOption(this.props.options, this.props.theme + '-metronic');
  }

  render() {
    const { width, height, className } = this.props;
    const { loading } = this.state;
    const style = { width, height };
    return (
      <div
        className={classNames('content-center-center', className)}
        style={style}
      >
        {loading && <LoadingSpinner />}
        <div
          className={classNames({ hidden: loading })}
          style={style}
          ref={(container) => (this.container = container)}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  theme: themeSelector(state),
});

export const EChart = connect(mapStateToProps)(EChartComponent);
