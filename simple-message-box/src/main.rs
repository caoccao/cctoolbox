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
use std::time::{Duration, SystemTime};

const APP_SHORT_NAME: &str = "smbox";
const APP_FULL_NAME: &str = "Simple Message Box";
const APP_VERSION: &str = "0.1.0";
const DEFAULT_MESSAGE: &str = "Hello from Simple Message Box!";
const TIMER_INTERVAL: Duration = Duration::from_millis(100);

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

  /// Title of the message box
  #[arg(short, long, default_value_t = APP_FULL_NAME.to_string())]
  title: String,

  /// Messages to be shown
  #[arg(name = "messages")]
  messages: Vec<String>,

  /// Verbose
  #[arg(short, long, name = "verbose", default_value_t = false)]
  verbose: bool,
}

struct AutoCloseButton {
  button: druid::WidgetPod<i64, druid::widget::Button<i64>>,
  start_time: SystemTime,
  timer_token: druid::TimerToken,
  timeout: u64,
}

impl AutoCloseButton {
  fn new(timeout: u64) -> Self {
    Self {
      button: druid::WidgetPod::new(druid::widget::Button::dynamic(|seconds, _| match *seconds {
        2.. => format!("Close in {} seconds", seconds),
        1 => "Close in 1 second".to_string(),
        0 => "Close now".to_string(),
        _ => "Close".to_string(),
      })),
      start_time: SystemTime::now(),
      timer_token: druid::TimerToken::INVALID,
      timeout,
    }
  }
}

impl druid::widget::Widget<i64> for AutoCloseButton {
  fn event(&mut self, ctx: &mut druid::EventCtx, event: &druid::Event, data: &mut i64, env: &druid::Env) {
    match event {
      druid::Event::WindowConnected => self.timer_token = ctx.request_timer(TIMER_INTERVAL),
      druid::Event::Timer(timer_token) => {
        if *timer_token == self.timer_token {
          if self.timeout > 0 {
            if let Ok(duration) = SystemTime::now().duration_since(self.start_time) {
              let millis = self.timeout as i64 - duration.as_millis() as i64;
              if millis <= 0 {
                *data = 0;
                ctx.submit_command(druid::commands::CLOSE_ALL_WINDOWS);
              } else {
                *data = millis / 1000;
              }
            }
          }
          ctx.request_update();
          self.timer_token = ctx.request_timer(TIMER_INTERVAL);
        }
      }
      _ => (),
    }
    self.button.event(ctx, event, data, env);
  }

  fn lifecycle(&mut self, ctx: &mut druid::LifeCycleCtx, event: &druid::LifeCycle, data: &i64, env: &druid::Env) {
    self.button.lifecycle(ctx, event, data, env);
  }

  fn layout(
    &mut self,
    ctx: &mut druid::LayoutCtx,
    bc: &druid::BoxConstraints,
    data: &i64,
    env: &druid::Env,
  ) -> druid::Size {
    self.button.layout(ctx, bc, data, env)
  }

  fn paint(&mut self, ctx: &mut druid::PaintCtx, data: &i64, env: &druid::Env) {
    self.button.paint(ctx, data, env);
  }

  fn update(&mut self, ctx: &mut druid::UpdateCtx, _old_data: &i64, data: &i64, env: &druid::Env) {
    self.button.update(ctx, data, env);
  }
}

fn main() {
  let args = Args::parse();
  let window = druid::WindowDesc::new(build_ui(&args))
    .resizable(false)
    .set_always_on_top(true)
    .set_position(get_position(&args))
    .title(args.title)
    .window_size((args.width as f64, args.height as f64));
  let mut app_launcher = druid::AppLauncher::with_window(window);
  if args.verbose {
    app_launcher = app_launcher.log_to_console();
  }
  app_launcher.launch(-1).expect("Failed to launch application");
}

fn build_ui(args: &Args) -> impl druid::Widget<i64> {
  let messages = if args.messages.is_empty() {
    vec![DEFAULT_MESSAGE.to_string()]
  } else {
    args.messages.clone()
  };
  let mut flex = druid::widget::Flex::column().with_spacer(5.0);
  messages
    .iter()
    .filter(|message| !message.is_empty())
    .for_each(|message| {
      let label = druid::widget::Label::new(message.to_owned())
        .with_text_size(20.0)
        .with_line_break_mode(druid::widget::LineBreaking::WordWrap)
        .padding(4.0)
        .border(druid::Color::grey(0.6), 1.0)
        .rounded(5.0);
      flex.add_child(label);
    });
  let button_close = AutoCloseButton::new(args.timeout)
    .padding(10.0)
    .on_click(|ctx, _: &mut i64, _| ctx.submit_command(druid::commands::CLOSE_ALL_WINDOWS));
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
