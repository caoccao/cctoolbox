/*
* Copyright (c) 2024. caoccao.com Sam Cao
* All rights reserved.

* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at

* http://www.apache.org/licenses/LICENSE-2.0

* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

use clap::Parser;
use druid::WidgetExt;

const APP_SHORT_NAME: &str = "smbox";
const APP_FULL_NAME: &str = "Simple Message Box";
const APP_VERSION: &str = "0.1.0";
const DEFAULT_MESSAGE: &str = "Hello from Simple Message Box!";

#[derive(Parser, Debug)]
#[command(name = APP_SHORT_NAME)]
#[command(version = APP_VERSION)]
#[command(about = "Show a simple message box.")]
#[command(long_about = None)]
#[clap(author = "Sam Cao", version = APP_VERSION, about = APP_FULL_NAME)]
struct Args {
  /// Height of the message box
  #[arg(long, default_value_t = 300)]
  height: u32,

  /// Width of the message box
  #[arg(long, default_value_t = 400)]
  width: u32,

  /// Auto-close the message box after timeout (milliseconds)
  #[arg(long, default_value_t = 0)]
  timeout: u64,

  /// Auto-close the message box after timeout (milliseconds)
  #[arg(short, long, default_value_t = APP_FULL_NAME.to_string())]
  title: String,

  /// messages to be shown
  #[arg(name = "messages")]
  messages: Vec<String>,
}

fn main() {
  let args = Args::parse();
  let window = druid::WindowDesc::new(build_ui(&args))
    .resizable(false)
    .set_always_on_top(true)
    .set_position(get_position(&args))
    .title(args.title)
    .window_size((args.width as f64, args.height as f64));
  druid::AppLauncher::with_window(window)
    .log_to_console()
    .launch(())
    .expect("Failed to launch application");
}

fn build_ui(args: &Args) -> impl druid::Widget<()> {
  let messages = if args.messages.is_empty() {
    vec![DEFAULT_MESSAGE.to_string()]
  } else {
    args.messages.clone()
  };
  let mut flex = druid::widget::Flex::column().with_spacer(5.0);
  messages.iter().for_each(|message| {
    let label = druid::widget::Label::new(message.to_owned())
      .with_text_size(20.0)
      .with_line_break_mode(druid::widget::LineBreaking::WordWrap)
      .padding(4.0)
      .border(druid::Color::grey(0.6), 1.0)
      .rounded(5.0);
    flex.add_child(label);
  });
  let button_close = druid::widget::Button::new("Close")
    .padding(10.0)
    .on_click(|_, _: &mut (), _| druid::Application::global().quit());
  flex.add_child(button_close);
  flex.align_vertical(druid::UnitPoint::CENTER)
}

fn get_position(args: &Args) -> druid::Point {
  if let Some(monitor) = druid::Screen::get_monitors()
    .into_iter()
    .filter(|monitor| monitor.is_primary())
    .next()
  {
    let center = monitor.virtual_rect().center();
    druid::Point {
      x: center.x - args.width as f64 / 2.0,
      y: center.y - args.height as f64 / 2.0,
    }
  } else {
    druid::Point::ZERO
  }
}
