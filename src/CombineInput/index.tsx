import React, { useState, useEffect, forwardRef } from 'react';
import { Input, Tag } from 'antd';
import classnames from 'classnames';
import './index.less';
import { scanEvent } from '@/utils/scanEvent';

interface CombineValue {
  single?: string; // 输入框的值
  multiple?: Array<string>; // 单选框的值
}

interface CombineInputProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  value?: CombineValue; // value
  onChange?: (value: object) => void; // onchange 事件
  size?: 'large' | 'middle' | 'small'; // 输入框 的 size
  errorText?: string; // 错误的提示文字（本来是当做块来处理，ui不同意错误提示写在所有内容后面）
  add?: string; // 增加 multiple
  disabled?: boolean; // 是否置灰
}

const CombineInput: React.ForwardRefRenderFunction<
  HTMLDivElement,
  CombineInputProps
> = (props, ref) => {
  const {
    value = {},
    onChange,
    size,
    errorText,
    className,
    add,
    disabled,
  } = props;
  const [single, setSingle] = useState<string>(value.single || ''); // 输入框的值
  const [error, setError] = useState<string>(errorText || ''); // 错误内容，为了营造和antd一样的淡出效果
  const [multiple, setMultiple] = useState<Array<string>>(value.multiple || []); // 大块头的值

  // 输入框的 change 事件
  const onSingleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSingle(e.target.value);
  };
  // 父组件通知需要往大块头里面塞值
  useEffect(() => {
    if (add) {
      setMultiple([...multiple, add]);
      setSingle('');
    }
  }, [add]);

  // 营造antd一样的错误提示效果
  useEffect(() => {
    if (errorText === '') {
      setTimeout(() => {
        setError(errorText);
      }, 300);
    } else {
      errorText && setError(errorText);
    }
  }, [errorText]);

  const scanWrapper = (e: any) => {
    scanEvent(e, () => {});
  };

  // 初始化的时候将值置为空，并且清空错误
  useEffect(() => {
    setMultiple(value.multiple || []);
    setError('');
    window.addEventListener('keypress', scanWrapper, false);
    return () => {
      window.removeEventListener('keypress', scanWrapper, false);
    };
  }, []);

  // 给父组件的一个onChange事件
  const triggerChange = (single: string, multiple: Array<string>) => {
    if (onChange) {
      onChange({ ...value, single, multiple });
    }
  };

  // 输入框失焦事件
  const onSingleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    // 需要触发onChange
    triggerChange(single, multiple);
    // 如果不需要父组件手动加数据的话（即不用校验）可以直接操作
    if (!('add' in props) && single) {
      setMultiple([...multiple, single]);
      setSingle('');
    }
  };

  // 输入框 enter
  const onSingleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode !== 13) return;
    e.preventDefault();
    setSingle(single);
    triggerChange(single, multiple);
    if (!('add' in props) && single) {
      setMultiple([...multiple, single]);
      setSingle('');
    }
  };

  // 大块头 内 tag 点击删除
  const onTagClose = function(e: React.MouseEvent<HTMLElement>, single: string) {
    e.preventDefault();
    let arr = [...multiple];
    const index = arr.findIndex(e => e === single);
    arr.splice(index, 1);
    triggerChange('', arr);
    setMultiple([...arr]);
  };

  return (
    <div className={classnames('yap-combine', className)} ref={ref}>
      <Input
        size={size}
        type="text"
        value={single}
        onChange={onSingleChange}
        onBlur={onSingleBlur}
        onKeyDown={onSingleKeyDown}
        disabled={disabled || false}
        placeholder="手动输入点击回车添加"
        allowClear
      ></Input>
      <p className={'yap-combine__error'}>
        <span
          className={classnames('error-text', {
            'show': errorText,
          })}
        >
          {error}
        </span>
      </p>
      <p className={'yap-combine__tips'}>
        已添加
        <span
          className={classnames('yap-combine-multiple-num', {
            ['yap-combine-multiple-num--yellow']: multiple.length,
          })}
        >
          {multiple.length}
        </span>
        个
      </p>
      <div className={'yap-combine-multiple-box'} style={{ minHeight: 200 }}>
        <div className={'yap-combine-multiple-box-inner'}>
          {multiple.length > 0 &&
            multiple.map((single, index) => (
              <Tag
                className="m-normal-tag"
                closable
                key={index}
                onClose={(e) => onTagClose(e, single)}
              >
                {single}
              </Tag>
            ))}
        </div>
      </div>
    </div>
  );
};

export default forwardRef(CombineInput);
