## Ising

![Ising](Icon.png "Ising")


Isingは,簡素なイジングモデルです。  
平面上に並ぶスピンを持った粒子のスピンの変化をシミュレーションしています。  
それぞれのスピンは,上下左右で隣接する粒子のスピンに応じて変化します。  
各々のパラメータを変化させた際のスピンの様子を楽しめます。

### 基本

- ページをロードした直後から,イジング模型は変化していく。
- パラメータを変化させると,全体的なスピンの移り変わり方にも変化が生じる。
- 2次元上のスピンのデータを表示するレンダラーが数種類用意されているので,ブラウザで最も的確に表示可能なレンダラーを選択して利用できる。

### パラメータ

- **T** … 温度  
	一般的に値を大きくすると,周囲のスピンの影響を受けにくくなり,乱雑さが増す。  
	逆に値を小さくすると,一様な模様に変化していく。

- **H** … 外部磁場  
	外部磁場を正又は負に加えると,スピンが一様な方向に向き,乱雑さが減る。
  
- **J** … 影響の受け方  
	スピンが周囲のスピンに受ける影響を示す定数である。  
	+1 だと周囲のスピンに合わせるような影響を受け, 0 だと無影響で, -1 だと周囲のスピンに背く向きに影響を受ける。  
	物理的には +1 が適切な値。
  
- **pixels** … ピクセル数  
	正方形領域1辺に含まれるスピンの数を指定する。

- **Pause** … 一時停止  
	オンになっている時には状態遷移を停止させる。

### レンダラー
以下のうち,実行環境において利用可能なレンダラーのみが表示される。  
利用可能であっても的確に表示されるとは限らない。

- **Grid**  
	`<div>` をグリッドレイアウトで配置させ,各々の背景を着色させて描画する。

- **Flex**  
	`<div>` を縦横それぞれにフレックスレイアウトで配置させ,各々の背景を着色させて描画する。

- **Table**  
	`<table>` を使って表を組み,各々のセル `<td>` の背景を着色させて描画する。

- **Background Image**  
	`<div>` の背景画像として,単色の画像を数多く並べることで描画する。

- **SVG Rect**  
	インラインSVGにおいて正方形 `<rect>` を並べて,各々を色で塗りつぶして描画する。

- **Canvas 2D**  
	`<canvas>` の 2D コンテクストで正方形を並べて描画する。

- **WebGL** / **WebGL 2**  
	`<canvas>` の WebGL コンテクストで描画する。  
	OpenGLシェーダーによりGPUを用いるため,パフォーマンスが向上しうる。

- **WebMetal**  
	`<canvas>` の WebMetal コンテクストで描画する。  
	AppleのMetalシェーダーによりGPUを用いるため,パフォーマンスが向上しうる。  
	Safariの場合は,設定からWebMetalを有効にすることで利用可能になる。

- **WebGPU** (Experimental)  
	`<canvas>` の WebGPU コンテクストで描画する。  
	WHLSLシェーダーによりGPUを用いるため,パフォーマンスが向上しうる。  
	現在のところ,正常に描画できない可能性が高い。そもそも,WebGPUの仕様が不完全である。


### 特記事項
- JavaScript,CSSを無効にすると利用できない。
- 同じURLでそのままデスクトップでも,モバイルでも利用できる。
- Internet Explorerでは利用できない。
- iOSデバイスでは,ホーム画面にアイコンを追加すると,スタンドアロンで開く。
- iPhone X 対応。
- iOSのChromeでは適切に表示されない。

### 更新内容
- レイアウトが崩れる問題を修正

### 開く
- [オンライン版](https://akimikimikimikimikimikimika.github.io/Ising/Ising.html "Isingオンライン版")
- [オフライン版](https://akimikimikimikimikimikimika.github.io/Ising/offline.html "Isingオフライン版")
- [ソースコード (GitHub)](https://github.com/akimikimikimikimikimikimika/Ising/ "ソースコード")

オンライン版では,全てのコンテンツを組み込み,常に最新の状態で利用できます。  
オフライン版では,オンライン版と同じ体験をオフラインでもできるようにします。URLのdataスキームに全てのソースコードを埋め込んでいるので,一部コンテンツに制限があります。